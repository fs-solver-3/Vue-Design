import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import Highcharts, { Point, TooltipFormatterContextObject } from 'highcharts';
import { HistogramQuerySetting, HistogramVizSetting, ThemeColor, VizSetting, VizSettingData } from '@core/domain/Model';
import { BaseHighChartWidget, createPlotOptionsWithRightClickListener, MouseEventData } from '@chart/BaseChart.ts';
import { merge } from 'lodash';
import { SeriesOneResponse, SeriesTwoResponse } from '@core/domain/Response';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { DIException } from '@core/domain/Exception';
import { HighchartUtils, ListUtils, MetricNumberMode } from '@/utils';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { Log } from '@core/utils';
import { NumberFormatter, RangeData } from '@core/services';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { ThemeModule } from '@/store/modules/theme.store';

@Component
@ClassProfiler({ prefix: 'HighchartsHistogramChart' })
export default class HistogramChart extends BaseHighChartWidget<SeriesOneResponse, HistogramVizSetting, HistogramQuerySetting> {
  private numberFormatter: NumberFormatter;

  @Prop({ default: -1 })
  id!: string | number;
  @Prop({ type: String, default: '' })
  subTitle!: string;
  @Prop({ type: String, default: '' })
  title!: string;
  @Prop()
  textColor?: string;
  @Prop()
  backgroundColor?: string;
  @Prop({ required: true, type: Object })
  data!: SeriesOneResponse;
  @Prop({ required: true, type: Object })
  setting!: HistogramVizSetting;
  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;
  @Prop({ required: true })
  query!: HistogramQuerySetting;
  @Ref()
  chart: any;
  // todo: fixme return correct default type
  protected renderController: RenderController<SeriesTwoResponse>;

  constructor() {
    super();
    const plotSeriesOptions: Highcharts.PlotSeriesOptions = createPlotOptionsWithRightClickListener(this.showContextMenu);
    const histogramLabel = {
      title: { text: '' },
      tickLength: 0
    };
    const dataLabelsFormatter = this.dataLabelsFormatter;
    const tooltipFormatter = this.tooltipFormatter;
    const manualOptions = {
      chart: {
        type: 'column',
        renderTo: 'container'
      },
      colors: this.setting.colors,
      xAxis: [histogramLabel],
      yAxis: [histogramLabel],
      plotOptions: {
        series: {
          ...plotSeriesOptions,
          borderColor: this.setting.getBackgroundColor(),
          dataLabels: {
            useHTML: true,
            formatter: function() {
              return dataLabelsFormatter((this as any) as Highcharts.PointLabelObject);
            }
          }
        }
      },
      tooltip: {
        useHTML: true,
        formatter: function() {
          return tooltipFormatter((this as any) as Highcharts.TooltipFormatterContextObject);
        }
      }
    };
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options?.plotOptions?.series?.dataLabels?.displayUnit ?? MetricNumberMode.Default);
    this.updateOptions(manualOptions);
    this.renderController = this.createRenderController();
  }

  private showContextMenu(mouseEventData: MouseEventData<Point>) {
    mouseEventData.event.preventDefault();
    Log.debug('showContextMenu::', mouseEventData.data);
    const mouseEventDataAString = new MouseEventData<string>(mouseEventData.event, mouseEventData.data.category);
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.id, mouseEventDataAString);
  }

  private buildFormatterByMetricNumber(metricNumber: MetricNumberMode) {
    const metricNumbers = HighchartUtils.toMetricNumbers(metricNumber);
    const ranges: RangeData[] | undefined = HighchartUtils.buildRangeData(metricNumbers);
    return new NumberFormatter(ranges);
  }

  private createRenderController(): RenderController<SeriesTwoResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
  }

  beforeDestroy() {
    this.renderController.dispose();
  }

  @Watch('title')
  onTitleChanged() {
    if (this.isCustomDisplay()) {
      this.buildCustomChart();
    } else {
      this.updateChartInfo();
    }
  }

  @Watch('subTitle')
  onSubtitleChanged() {
    if (this.isCustomDisplay()) {
      this.buildCustomChart();
    } else {
      this.updateChartInfo();
    }
  }

  @Watch('setting')
  onChartSettingChanged() {
    this.reRenderChart();
  }

  @Watch('data')
  onChartDataChanged() {
    this.reRenderChart();
  }

  @Watch('textColor')
  onTextColorChanged() {
    if (this.isCustomDisplay()) {
      this.buildCustomChart();
    } else {
      this.updateTextColor(this.textColor, true);
    }
  }

  @Watch('setting.options.plotOptions.series.dataLabels.displayUnit')
  onNumberMetricChanged(newMetricNumberMode: MetricNumberMode) {
    const newMetricNumber: string[] | undefined = HighchartUtils.toMetricNumbers(newMetricNumberMode);
    const newRanges: RangeData[] | undefined = HighchartUtils.buildRangeData(newMetricNumber);
    this.numberFormatter.setRanges(newRanges);
  }

  mounted() {
    this.reRenderChart();
  }

  updateOptions(newOptions: any) {
    this.options = merge({}, VizSetting.CONFIG, HistogramVizSetting.DEFAULT_SETTING, this.options, newOptions);
  }

  isHorizontalZoomIn(): boolean {
    return false;
  }

  isHorizontalZoomOut(): boolean {
    return false;
  }

  protected getChart(): Highcharts.Chart | undefined {
    return this.chart.getChart();
  }

  protected buildHighchart() {
    try {
      this.updateMetricNumber(this.setting.options);
      HighchartUtils.reset(this.getChart());
      this.load(this.data);
      this.buildAxis(this.data);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`HighchartsHistogramChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  protected load(chartData: SeriesOneResponse) {
    HighchartUtils.addSeries(this.getChart(), chartData.series);
  }

  //TODO: buildAxis is empty
  protected buildAxis(chartData: SeriesOneResponse) {
    const options: any = {};

    if (ListUtils.isNotEmpty(chartData.xAxis)) {
      options['xAxis'] = {
        // type: 'category',
        categories: chartData.xAxis
      };
    }
    HighchartUtils.updateChart(this.getChart(), options);
  }

  protected resizeHighchart(): void {
    this.getChart()?.reflow();
  }

  private updateTextColor(color: string | undefined, reDraw: boolean): void {
    // if (color) {
    //   const newStyle = {
    //     color: color
    //   };
    //   const newColorOption = {
    //     legend: {
    //       itemStyle: newStyle
    //     },
    //     xAxis: [
    //       {
    //         title: {
    //           style: newStyle
    //         },
    //         labels: {
    //           style: newStyle
    //         }
    //       }
    //     ],
    //     yAxis: [
    //       {
    //         title: {
    //           style: newStyle
    //         },
    //         labels: {
    //           style: newStyle
    //         }
    //       }
    //     ]
    //   };
    //   HighchartUtils.updateChart(this.getChart(), newColorOption, reDraw);
    // }
  }

  private updateChartInfo() {
    HighchartUtils.updateChartInfo(this.getChart(), { title: this.title, subTitle: this.subTitle });
  }

  private updateMetricNumber(options: VizSettingData) {
    const metricNumber: string[] | undefined = HighchartUtils.toMetricNumbers(
      options?.plotOptions?.series?.dataLabels?.displayUnit ?? MetricNumberMode.Default
    );
    Highcharts.setOptions({
      plotOptions: {
        series: {
          dataLabels: {
            //@ts-ignore
            displayUnit: metricNumber
          }
        }
      }
    });
  }

  private dataLabelsFormatter(point: Highcharts.PointLabelObject): string {
    const formattedData = this.numberFormatter.format(point.y ?? 0);
    const textColor = this.setting.options?.plotOptions?.series?.dataLabels?.style?.color ?? '#fff';
    return `<div style="color: ${textColor}"> ${formattedData}</div>`;
  }

  private tooltipFormatter(contextObject: TooltipFormatterContextObject) {
    const formattedData = this.numberFormatter.format(contextObject.y);
    const field = contextObject.series.name;
    const fieldProperty = contextObject.key;
    const pointColor = contextObject.color;
    //@ts-ignore
    const textColor = this.setting?.options?.tooltip?.style?.color ?? '#fff';
    //@ts-ignore
    const fontFamily = this.setting?.options?.tooltip?.style?.fontFamily ?? 'Barlow';
    return `<div style="color: ${textColor}; text-align: left; font-family: ${fontFamily}">
                <span style="font-size: 10px;">${fieldProperty}</span><br/>
                <span style="color:${pointColor}">●</span>
                ${field}: <b>${formattedData}</b><br/>
            </div>`;
  }

  private get themeColors(): string[] {
    return ThemeModule.paletteColor;
  }

  @Watch('themeColors')
  onThemeColorsChanged(newColors: string[]): void {
    const enableChangeColorByTheme = this.setting.options.themeColor?.enabled ?? true;
    if (enableChangeColorByTheme) {
      HighchartUtils.updateColors(this.getChart(), newColors);
    }
  }

  @Watch('setting.options.themeColor', { deep: true })
  onColorConfigChanged(newConfig: ThemeColor) {
    const enableChangeColorByTheme = newConfig?.enabled ?? true;
    if (enableChangeColorByTheme) {
      HighchartUtils.updateColors(this.getChart(), this.themeColors);
    } else {
      HighchartUtils.updateColors(this.getChart(), newConfig.colors ?? []);
    }
  }
}
