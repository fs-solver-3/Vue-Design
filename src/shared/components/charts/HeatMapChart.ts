import Highcharts, { Point, TooltipFormatterContextObject } from 'highcharts';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { HeatMapVizSetting, HeatMapQuerySetting, VizSetting } from '@core/domain/Model';
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
import { NumberFormatter, RangeData } from '@core/services/formatter';
import { Log } from '@core/utils';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';

@Component
@ClassProfiler({ prefix: 'HeatMapChart' })
export default class HeatMapChart extends BaseHighChartWidget<SeriesTwoResponse, HeatMapVizSetting, HeatMapQuerySetting> {
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
  setting!: HeatMapVizSetting;

  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;

  @Prop({ required: true })
  query!: HeatMapQuerySetting;

  @Ref()
  chart: any;

  // todo: fixme return correct default type
  protected renderController: RenderController<SeriesTwoResponse>;

  constructor() {
    super();
    const plotSeriesOptions: Highcharts.PlotSeriesOptions = createPlotOptionsWithRightClickListener(this.showContextMenu);

    const tooltipFormatter = this.tooltipFormatter;
    const dataLabelsFormatter = this.dataLabelsFormatter;
    const manualOptions = {
      chart: {
        type: 'heatmap'
      },
      plotOptions: {
        heatmap: {
          ...plotSeriesOptions,
          turboThreshold: this.data.series[0].data.length + 1000,
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
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options.plotOptions?.heatmap?.dataLabels?.displayUnit ?? MetricNumberMode.Default);
    this.renderController = this.createRenderController();
  }

  private showContextMenu(mouseEventData: MouseEventData<Point>) {
    mouseEventData.event.preventDefault();
    Log.debug('mouse', mouseEventData.data);
    const mouseEventDataAString = new MouseEventData<string>(mouseEventData.event, mouseEventData.data.category);
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.id, mouseEventDataAString);
  }

  private tooltipFormatter(contextObject: TooltipFormatterContextObject) {
    const formattedData = this.numberFormatter.format(contextObject.point.value ?? 0);
    const pointColor = contextObject.color;
    //@ts-ignore
    const textColor = this.setting?.options?.tooltip?.style?.color ?? '#fff';
    //@ts-ignore
    const fontFamily = this.setting?.options?.tooltip?.style?.fontFamily ?? 'Barlow';
    return `<div style="color: ${textColor}; font-family: ${fontFamily}; text-align: left">
                <div style="font-size: 10px"><span style="color:${pointColor}">●</span> ${contextObject.series.name}</div>
                ${contextObject.point.x}, ${contextObject.point.y}: <b>${formattedData}</b><br/>
            </div>`;
  }

  private dataLabelsFormatter(point: Highcharts.PointLabelObject): string {
    const formattedData = this.numberFormatter.format(point.point.value ?? 0);
    const textColor = this.setting.options.plotOptions?.heatmap?.dataLabels?.style?.color ?? '#fff';
    return `<div style="color: ${textColor}; text-align: left">
                <b>${formattedData}</b><br/>
            </div>`;
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

  @Watch('setting.options.plotOptions.heatmap.dataLabels.displayUnit')
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
    this.options = merge({}, VizSetting.CONFIG, HeatMapVizSetting.DEFAULT_SETTING, this.options, newOptions);
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

  protected buildHighchart(): void {
    try {
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
        Log.error(`HighchartsHeatMapChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  protected buildAxis(chartData: SeriesTwoResponse) {
    const options: any = {};
    if (chartData.xAxis) {
      options['xAxis'] = {
        type: 'category',
        categories: chartData.xAxis
      };
    }
    if (chartData.yAxis) {
      options['yAxis'] = {
        type: 'category',
        categories: chartData.yAxis
      };
    }
    HighchartUtils.updateChart(this.getChart(), options);
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
}
