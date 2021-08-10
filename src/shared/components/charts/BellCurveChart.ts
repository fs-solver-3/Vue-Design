import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts';
import { merge } from 'lodash';
import { BaseHighChartWidget } from '@chart/BaseChart.ts';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { DIException } from '@core/domain/Exception';
import { BellCurveQuerySetting, BellCurveVizSetting, VizSetting, VizSettingData } from '@core/domain/Model';
import { SeriesTwoResponse } from '@core/domain/Response';
import { HighchartUtils, MetricNumberMode } from '@/utils';
import { RenderController } from '@chart/custom/RenderController';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { DI } from '@core/modules';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { Log } from '@core/utils';
import { NumberFormatter, RangeData } from '@core/services/formatter';

@Component
@ClassProfiler({ prefix: 'BellCurveChart' })
export default class BellCurveChart extends BaseHighChartWidget<SeriesTwoResponse, BellCurveVizSetting, BellCurveQuerySetting> {
  public static readonly BASE_SERIES_INDEX = 0;

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
  data!: SeriesTwoResponse;
  @Prop({ required: true, type: Object })
  setting!: BellCurveVizSetting;
  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;
  @Prop({ required: true })
  query!: BellCurveQuerySetting;
  @Ref()
  chart: any;
  // todo: fixme return correct default type
  protected renderController: RenderController<SeriesTwoResponse>;

  constructor() {
    super();
    const tooltipFormatter = this.tooltipFormatter;
    const bellCurveLabel = {
      title: { text: 'Bell Curve' },
      opposite: true
    };
    const defaultLabel = {
      title: { text: '' }
    };
    const manualOptions: Highcharts.Options = {
      xAxis: [defaultLabel, bellCurveLabel],
      yAxis: [defaultLabel, bellCurveLabel],
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
    if (contextObject.point.name) {
      return this.tooltipPointFormat(contextObject);
    } else {
      return this.bellCurveFormat(contextObject);
    }
  }
  tooltipPointFormat(contextObject: TooltipFormatterContextObject) {
    const field = contextObject.series.name;
    const pointColor = contextObject.color;
    const formattedXAxis = this.numberFormatter.format(contextObject.x);
    const formattedYAxis = this.numberFormatter.format(contextObject.y);
    return `<div style=" text-align: left">
                <span style="color:${pointColor}">●</span>  <span style="font-size: 10px;">${field}</span><br/>
                x: <b>${formattedXAxis}</b><br/>
                y: <b>${formattedYAxis}</b><br/>
            </div>`;
  }

  bellCurveFormat(contextObject: TooltipFormatterContextObject) {
    const bellCurveName = contextObject.series.name;
    const textColor = this.setting.options.textColor;
    const pointColor = contextObject.color;
    const formattedData = this.numberFormatter.format(contextObject.x);
    const bellCurveValue = contextObject.y;
    return `<div style="color: ${textColor}; text-align: left">
                <span style="color:${pointColor}">●</span>
                <b>${formattedData}</b><br/>
               ${bellCurveName}: <b>${bellCurveValue}</b><br/>
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

  @Watch('setting.options.metricNumbers')
  onNumberMetricChanged(newMetricNumberMode: MetricNumberMode) {
    const newMetricNumber: string[] | undefined = HighchartUtils.toMetricNumbers(newMetricNumberMode);
    const newRanges: RangeData[] | undefined = HighchartUtils.buildRangeData(newMetricNumber);
    this.numberFormatter.setRanges(newRanges);
  }

  mounted() {
    this.reRenderChart();
  }

  updateOptions(newOptions: any) {
    this.options = merge({}, VizSetting.CONFIG, BellCurveVizSetting.DEFAULT_SETTING, this.options, newOptions);
  }

  isHorizontalZoomIn(): boolean {
    return false;
  }

  isHorizontalZoomOut(): boolean {
    return false;
  }

  beforeDestroy() {
    this.renderController.dispose();
  }

  protected getChart(): Highcharts.Chart | undefined {
    return this.chart.getChart();
  }

  protected buildHighchart() {
    try {
      this.updateMetricNumber(this.setting.options);
      HighchartUtils.reset(this.getChart());
      const bellCurveIndex = this.getBellCurveIndex(this.setting.baseTypes);
      this.load(this.data, bellCurveIndex);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`HighchartsBellCurveChart:: buildChart:: ${e.toString()}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  protected load(chartData: SeriesTwoResponse, bellCurveIndex: number) {
    const series = this.toSeries(chartData, bellCurveIndex);
    HighchartUtils.addSeries(this.getChart(), series);
  }

  protected resizeHighchart(): void {
    this.getChart()?.reflow();
  }

  private updateChartInfo() {
    HighchartUtils.updateChartInfo(this.getChart(), { title: this.title, subTitle: this.subTitle });
  }

  private toSeries(chartData: SeriesTwoResponse, bellCurveIndex: number) {
    const bell: any = {
      name: 'Bell curve',
      type: 'bellcurve',
      xAxis: 1,
      yAxis: 1,
      baseSeries: bellCurveIndex,
      zIndex: -1
    };
    const series = Array.from<any>(chartData.series);
    series.push(bell);
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
    //   if (this.isCustomDisplay()) {
    //     this.buildCustomChart();
    //   } else {
    //     HighchartUtils.updateChart(this.getChart(), newColorOption, reDraw);
    //   }
    // }
  }

  private getBellCurveIndex(baseTypes: Record<string, number>): number {
    if (baseTypes && baseTypes['bellCurve']) {
      return baseTypes['bellCurve'];
    }

    return BellCurveChart.BASE_SERIES_INDEX;
  }

  private updateMetricNumber(options: VizSettingData) {
    const metrixNumber: string[] | undefined = HighchartUtils.toMetricNumbers(options.metricNumbers ?? MetricNumberMode.Default);
    Highcharts.setOptions({
      lang: {
        numericSymbols: metrixNumber
      }
    });
  }
}
