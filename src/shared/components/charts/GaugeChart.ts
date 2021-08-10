import Highcharts, { Point, Series, TooltipFormatterContextObject } from 'highcharts';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { GaugeQuerySetting, GaugeVizSetting, VizSetting, VizSettingData } from '@core/domain/Model';
import { DIException } from '@core/domain/Exception';
import { isNaN, isNumber, merge, toNumber } from 'lodash';
import { BaseHighChartWidget, MouseEventData } from '@chart/BaseChart.ts';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { SeriesOneItem, SeriesOneResponse, SeriesTwoResponse } from '@core/domain/Response';
import { HighchartUtils, ListUtils, MetricNumberMode } from '@/utils';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { NumberFormatter, RangeData } from '@core/services/formatter';
import { Log } from '@core/utils';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';

export enum FormatterMode {
  target = 0,
  max = 1,
  normal = 2
}

@Component
@ClassProfiler({ prefix: 'GaugeChart' })
export default class GaugeChart extends BaseHighChartWidget<SeriesOneResponse, GaugeVizSetting, GaugeQuerySetting> {
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
  setting!: GaugeVizSetting;
  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;
  @Prop({ required: true })
  query!: GaugeQuerySetting;
  @Ref()
  chart: any;
  // todo: fixme return correct default type
  protected renderController: RenderController<SeriesTwoResponse>;
  private numberFormatter: NumberFormatter;

  constructor() {
    super();
    const formatter = this.formatter;
    const tooltipFormatter = this.tooltipFormatter;
    const manualOptions: Highcharts.Options = {
      yAxis: {
        min: 0,
        max: 10000,
        tickPositioner: () => [this.minValue, this.maxValue]
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            format: void 0,
            formatter: function() {
              return formatter((this as any) as Highcharts.PointLabelObject);
            }
          }
        },
        gauge: {}
      },
      tooltip: {
        useHTML: true,
        formatter: function(tooltip) {
          return tooltipFormatter((this as any) as Highcharts.TooltipFormatterContextObject);
        }
      }
    };
    this.numberFormatter = this.buildFormatterByMetricNumber(
      this.setting.options?.plotOptions?.solidgauge?.dataLabels?.displayUnit ?? MetricNumberMode.Default
    );
    this.updateOptions(manualOptions);
    this.renderController = this.createRenderController();
  }

  private get targetValue(): number {
    const targetValue = toNumber(this.setting.options.target);
    if (this.isPositiveNumber(targetValue)) {
      return targetValue;
    }
    return 0;
  }

  private get maxValue(): number {
    const maxValue = toNumber(this.setting.options.yAxis?.max);
    if (this.isPositiveNumber(maxValue)) {
      return maxValue;
    } else {
      return 0;
    }
  }

  private get minValue(): number {
    const minValue = toNumber(this.setting.options.yAxis?.min);
    if (isNaN(minValue)) {
      return 0;
    } else {
      return minValue;
    }
  }

  private get hasTargetValue(): boolean {
    return this.isPositiveNumber(this.targetValue);
  }

  private get displayTargetValue(): number {
    return Math.min(this.maxValue, this.targetValue);
  }

  private get isPercentage(): boolean {
    return this.setting.options.percentage;
  }

  private get formatterMode(): FormatterMode {
    if (this.hasTargetValue && this.isPercentage) {
      return FormatterMode.target;
    } else if (!this.hasTargetValue && this.isPercentage) {
      return FormatterMode.max;
    } else {
      return FormatterMode.normal;
    }
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

  @Watch('setting.options.plotOptions.solidgauge.dataLabels.displayUnit')
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
    this.options = merge({}, VizSetting.CONFIG, GaugeVizSetting.DEFAULT_SETTING, this.options, newOptions);
  }

  isHorizontalZoomIn(): boolean {
    return false;
  }

  isHorizontalZoomOut(): boolean {
    return false;
  }

  buildTargetSerie(targetValue: number): SeriesOneItem {
    return {
      name: '',
      yAxis: 0,
      data: [targetValue],
      type: 'gauge'
    };
  }

  protected getChart(): Highcharts.Chart | undefined {
    return this.chart?.getChart();
  }

  protected buildHighchart() {
    try {
      HighchartUtils.reset(this.getChart());
      const series: Series[] = this.load(this.data);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      HighchartUtils.drawChart(this.getChart());
      this.assignRightClick(series);
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`HighchartsGaugeChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  protected load(chartData: SeriesOneResponse) {
    if (!ListUtils.hasOnlyOneItem(chartData.series) || !ListUtils.hasOnlyOneItem(chartData.series[0].data))
      throw new DIException('Gauge chart only support table with 1 row and 1 column');

    const newChartSeries = [...chartData.series];
    if (this.hasTargetValue) {
      const targetOption: SeriesOneItem = this.buildTargetSerie(this.displayTargetValue);
      newChartSeries.push(targetOption);
    }
    return HighchartUtils.addSeries(this.getChart(), newChartSeries);
  }

  protected resizeHighchart(): void {
    this.getChart()?.reflow();
  }

  private createRenderController(): RenderController<SeriesTwoResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
  }

  private isPositiveNumber(number: number): boolean {
    return isNumber(number) && !isNaN(number) && number > 0;
  }

  private formatter(point: Highcharts.PointLabelObject) {
    const formatterMode: FormatterMode = this.formatterMode;

    switch (formatterMode) {
      case FormatterMode.target:
        return this.targetPercentageFormat(point);
      case FormatterMode.max:
        return this.maxTargetPercentage(point);
      default:
        return this.normalFormat(point);
    }
  }

  private tooltipFormatter(contextObject: TooltipFormatterContextObject) {
    const formattedData = this.numberFormatter.format(contextObject.y);
    const tooltipLabel = contextObject.series.name;
    const pointColor = contextObject.color;
    //@ts-ignore
    const textColor = this.setting?.options?.tooltip?.style?.color ?? '#fff';
    //@ts-ignore
    const fontFamily = this.setting?.options?.tooltip?.style?.fontFamily ?? 'Barlow';
    return `<div style="color: ${textColor}; font-family: ${fontFamily}">
<!--                <span style="color:${pointColor}">●</span>-->
                ${tooltipLabel}: <b>${formattedData}</b><br/>
            </div>`;
  }

  private targetPercentageFormat(point: Highcharts.PointLabelObject) {
    const currentValue = point.y ?? 0;
    const rateBaseOnTargetValue = currentValue / this.targetValue;
    const textColor = this.setting.options.textColor;
    const renderData = Math.round(rateBaseOnTargetValue * 100);
    return `<div style="color: ${textColor}">${renderData} %</div>`;
  }

  private maxTargetPercentage(point: Highcharts.PointLabelObject) {
    const currentValue = point.y ?? 0;
    const rateBaseOnMaxValue = currentValue / this.maxValue;
    const renderData = Math.round(rateBaseOnMaxValue * 100);
    const textColor = this.setting.options.textColor;
    return `<div style="color: ${textColor}">${renderData} %</div> `;
  }

  private normalFormat(point: Highcharts.PointLabelObject) {
    const formattedData = this.numberFormatter.format(point.y ?? 0);
    const textColor = this.setting.options.textColor;
    return `<div style="color: ${textColor}">${formattedData}</div>`;
  }

  private updateTextColor(color: string | undefined, reDraw: boolean): void {
    // if (color) {
    //   const newStyle = {
    //     color: color
    //   };
    //   const newColorOption = {
    //     plotOptions: {
    //       treemap: {
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

  private buildFormatterByMetricNumber(metricNumber: MetricNumberMode) {
    const metricNumbers = HighchartUtils.toMetricNumbers(metricNumber);
    const ranges: RangeData[] | undefined = HighchartUtils.buildRangeData(metricNumbers);
    return new NumberFormatter(ranges);
  }

  private assignRightClick(series: Series[]) {
    try {
      HighchartUtils.addSeriesEvent(series, 'contextmenu', (event, point) => {
        const data: MouseEventData<Point> = new MouseEventData<Point>(event as MouseEvent, point);
        this.showContextMenu(data);
      });
    } catch (ex) {
      Log.error('assignRightClick::ex', ex);
    }
  }

  private showContextMenu(mouseEventData: MouseEventData<Point>) {
    mouseEventData.event.preventDefault();
    Log.debug('showDrilldown::at', mouseEventData.event.clientX, mouseEventData.event.clientY, mouseEventData.data);
    const mouseEventDataAString = new MouseEventData<string>(mouseEventData.event, mouseEventData.data.name);
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.id, mouseEventDataAString);
  }
}
