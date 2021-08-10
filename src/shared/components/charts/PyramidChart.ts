import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import Highcharts, { Point, TooltipFormatterContextObject } from 'highcharts';
import { VizSettingData, PyramidVizSetting, PyramidQuerySetting, VizSetting, ThemeColor } from '@core/domain/Model';
import { merge } from 'lodash';
import { BaseHighChartWidget, createPlotOptionsWithRightClickListener, MouseEventData } from '@chart/BaseChart.ts';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { DIException } from '@core/domain/Exception';
import { SeriesTwoResponse } from '@core/domain/Response';
import { HighchartUtils, MetricNumberMode } from '@/utils';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { DataLabelFormatterMode } from '@chart/PieChart';
import { NumberFormatter, RangeData } from '@core/services/formatter';
import { Log } from '@core/utils';
import { ThemeModule } from '@/store/modules/theme.store';

@Component
@ClassProfiler({ prefix: 'PyramidChart' })
export default class PyramidChart extends BaseHighChartWidget<SeriesTwoResponse, PyramidVizSetting, PyramidQuerySetting> {
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
  data!: SeriesTwoResponse;

  @Prop({ required: true, type: Object })
  setting!: PyramidVizSetting;

  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;

  @Prop({ required: true })
  query!: PyramidQuerySetting;

  @Ref()
  chart: any;
  // todo: fixme return correct default type
  protected renderController: RenderController<SeriesTwoResponse>;

  constructor() {
    super();
    const plotPyramidOptions: Highcharts.PlotPyramidOptions = createPlotOptionsWithRightClickListener(this.showDrilldown);
    const tooltipFormatter = this.tooltipFormatter;
    const dataLabelsFormatter = this.dataLabelsFormatter;
    const manualOptions: Highcharts.Options = {
      chart: {
        type: 'pyramid'
      },
      colors: this.setting.colors,
      plotOptions: {
        pyramid: {
          ...plotPyramidOptions,
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
    this.updateOptions(manualOptions);
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options?.plotOptions?.pyramid?.dataLabels?.displayUnit ?? MetricNumberMode.Default);
    this.renderController = this.createRenderController();
  }

  private dataLabelsFormatter(point: Highcharts.PointLabelObject): string {
    const dataLabelsMode: DataLabelFormatterMode = this.setting.options?.plotOptions?.pyramid?.dataLabels?.labelFormat ?? DataLabelFormatterMode.NameAndValue;
    const textColor = this.setting.options?.plotOptions?.pyramid?.dataLabels?.style?.color ?? '#fff';
    switch (dataLabelsMode) {
      case DataLabelFormatterMode.NameAndPercent:
        return this.nameAndPercentFormat(point, textColor);
      case DataLabelFormatterMode.NameAndValue:
        return this.nameAndValueFormat(point, textColor);
      case DataLabelFormatterMode.Name:
        return this.nameFormat(point, textColor);
    }
  }

  private nameAndPercentFormat(point: Highcharts.PointLabelObject, textColor: string): string {
    const dataFormatted = NumberFormatter.round(point.percentage);
    const labelName = point.key;
    return `<div style="color:${textColor}">${labelName} : ${dataFormatted} %</div>`;
  }

  private nameAndValueFormat(point: Highcharts.PointLabelObject, textColor: string): string {
    const dataFormatted = this.numberFormatter.format(point.y ?? 0);
    const labelName = point.key;
    return `<div style="color:${textColor}">${labelName} : ${dataFormatted}</div>`;
  }

  private nameFormat(point: Highcharts.PointLabelObject, textColor: string): string {
    const labelName = point.key;
    return `<div style="color:${textColor}">${labelName}</div>`;
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
    const mouseEventDataAString = new MouseEventData<string>(mouseEventData.event, mouseEventData.data.name);
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.id, mouseEventDataAString);
  }

  private createRenderController(): RenderController<SeriesTwoResponse> {
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

  @Watch('setting.options.plotOptions.pyramid.dataLabels.displayUnit')
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
    this.options = merge({}, VizSetting.CONFIG, PyramidVizSetting.DEFAULT_SETTING, this.options, newOptions);
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
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`HighchartsPyramidChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  private updateMetricNumber(options: VizSettingData) {
    const metricNumber: string[] | undefined = HighchartUtils.toMetricNumbers(
      options?.plotOptions?.pyramid?.dataLabels?.displayUnit ?? MetricNumberMode.Default
    );
    Highcharts.setOptions({
      plotOptions: {
        pyramid: {
          dataLabels: {
            //@ts-ignore
            displayUnit: metricNumber
          }
        }
      }
    });
  }

  protected load(chartData: SeriesTwoResponse) {
    HighchartUtils.addSeries(this.getChart(), chartData.series);
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
    //     plotOptions: {
    //       pyramid: {
    //         dataLabels: {
    //           color: color
    //         }
    //       }
    //     }
    //   };
    //   HighchartUtils.updateChart(this.getChart(), newColorOption, reDraw);
    // }
  }

  private updateChartInfo() {
    HighchartUtils.updateChartInfo(this.getChart(), { title: this.title, subTitle: this.subTitle });
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
