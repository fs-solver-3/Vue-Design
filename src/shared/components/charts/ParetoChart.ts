import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import Highcharts, { Point, TooltipFormatterContextObject } from 'highcharts';
import { VizSettingData, ParetoVizSetting, ParetoQuerySetting, VizSetting, ThemeColor } from '@core/domain/Model';
import Pareto from 'highcharts/modules/pareto';
import { HighchartUtils, ListUtils, MetricNumberMode } from '@/utils';
import { merge } from 'lodash';
import { BaseHighChartWidget, createPlotOptionsWithRightClickListener, MouseEventData } from '@chart/BaseChart.ts';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { DIException } from '@core/domain/Exception';
import { SeriesOneResponse } from '@core/domain/Response';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { NumberFormatter, RangeData } from '@core/services/formatter';
import { Log } from '@core/utils';
import { ThemeModule } from '@/store/modules/theme.store';

@Component
@ClassProfiler({ prefix: 'HighchartsParetoChart' })
export default class HighchartsParetoChart extends BaseHighChartWidget<SeriesOneResponse, ParetoVizSetting, ParetoQuerySetting> {
  static readonly BASE_SERIES_INDEX: number = 0;

  private numberFormatter!: NumberFormatter;

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
  setting!: ParetoVizSetting;

  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;

  @Prop({ required: true })
  query!: ParetoQuerySetting;

  @Ref()
  chart: any;

  // todo: fixme return correct default type
  protected renderController: RenderController<SeriesOneResponse>;

  constructor() {
    super();
    const plotSeriesOptions: Highcharts.PlotSeriesOptions = createPlotOptionsWithRightClickListener(this.showDrilldown);
    const tooltipFormatter = this.tooltipFormatter;
    const manualOptions: Highcharts.Options = {
      chart: {
        renderTo: 'container',
        type: 'column'
      },
      colors: this.setting.colors,
      plotOptions: {
        series: plotSeriesOptions
      },
      tooltip: {
        useHTML: true,
        formatter: function() {
          return tooltipFormatter((this as any) as Highcharts.TooltipFormatterContextObject);
        }
      }
    };
    this.updateOptions(manualOptions);
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options.metricNumbers ?? MetricNumberMode.Default);
    this.renderController = this.createRenderController();
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
    return `<div style="color: ${textColor}; font-family: ${fontFamily}; text-align: left">
                <span style="font-size: 10px;">${field}</span><br/>
                <span style="color:${pointColor}">●</span>
                ${fieldProperty}: <b>${formattedData}</b><br/>
            </div>`;
  }

  private buildFormatterByMetricNumber(metricNumber: MetricNumberMode) {
    const metricNumbers = HighchartUtils.toMetricNumbers(metricNumber);
    const ranges: RangeData[] | undefined = HighchartUtils.buildRangeData(metricNumbers);
    return new NumberFormatter(ranges);
  }

  private showDrilldown(mouseEventData: MouseEventData<Point>) {
    mouseEventData.event.preventDefault();
    Log.debug('showDrilldown::at', mouseEventData.event.clientX, mouseEventData.event.clientY, mouseEventData.data);
    const mouseEventDataAString = new MouseEventData<string>(mouseEventData.event, mouseEventData.data.category);
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.id, mouseEventDataAString);
  }

  private createRenderController(): RenderController<SeriesOneResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
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

  @Watch('setting.options.metricNumbers')
  onNumberMetricChanged(newMetricNumberMode: MetricNumberMode) {
    const newMetricNumber: string[] | undefined = HighchartUtils.toMetricNumbers(newMetricNumberMode);
    const newRanges: RangeData[] | undefined = HighchartUtils.buildRangeData(newMetricNumber);
    this.numberFormatter.setRanges(newRanges);
  }

  mounted() {
    this.reRenderChart();
  }

  beforeDestroy() {
    this.renderController.dispose();
  }

  updateOptions(newOptions: any) {
    this.options = merge({}, VizSetting.CONFIG, ParetoVizSetting.DEFAULT_SETTING, this.options, newOptions);
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
      const paretoIndex = this.getParetoIndex(this.setting.baseTypes);
      this.load(this.data, paretoIndex);
      this.buildAxis(this.data);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`HighchartsParetoChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  protected load(chartData: SeriesOneResponse, paretoIndex: number) {
    const series = this.toSeries(chartData, paretoIndex);
    HighchartUtils.addSeries(this.getChart(), series);
  }

  protected buildAxis(chartData: SeriesOneResponse) {
    const options: any = {};
    if (ListUtils.isNotEmpty(chartData.xAxis)) {
      options['xAxis'] = {
        type: 'category',
        categories: chartData.xAxis
      };
    }
    const paretoAxis = {
      title: { text: 'Pareto' },
      labels: {
        format: '{value}%'
      },
      opposite: true
    };
    if (ListUtils.isNotEmpty(chartData.yAxis)) {
      options['yAxis'] = [
        {
          type: 'category',
          categories: chartData.yAxis
        },
        paretoAxis
      ];
    } else {
      options['yAxis'] = [{}, paretoAxis];
    }
    HighchartUtils.updateChart(this.getChart(), options);
  }

  protected resizeHighchart(): void {
    this.getChart()?.reflow();
  }

  private toSeries(chartData: SeriesOneResponse, paretoIndex: number) {
    const pareto = {
      type: 'pareto',
      name: 'Pareto',
      yAxis: 1,
      baseSeries: paretoIndex
    };
    const series = Array.from<any>(chartData.series);
    series.push(pareto);
    return series;
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
    //       },
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
    //       },
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

  private getParetoIndex(baseTypes: Record<string, number>): number {
    if (baseTypes && baseTypes['pareto']) {
      return baseTypes['pareto'];
    }

    return HighchartsParetoChart.BASE_SERIES_INDEX;
  }

  private updateChartInfo() {
    HighchartUtils.updateChartInfo(this.getChart(), { title: this.title, subTitle: this.subTitle });
  }

  private updateMetricNumber(options: VizSettingData) {
    const metrixNumber: string[] | undefined = HighchartUtils.toMetricNumbers(options.metricNumbers ?? MetricNumberMode.Default);
    Highcharts.setOptions({
      lang: {
        numericSymbols: metrixNumber
      }
    });
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
