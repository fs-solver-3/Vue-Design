import Highcharts, { Point, TooltipFormatterContextObject } from 'highcharts';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { DIMap, StackedQuerySetting, StackedVizSetting, ThemeColor, VizSetting, VizSettingData } from '@core/domain/Model';
import { merge, camelCase } from 'lodash';
import { BaseHighChartWidget, createPlotOptionsWithRightClickListener, MouseEventData } from '@chart/BaseChart.ts';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { DIException } from '@core/domain/Exception';
import { HighchartUtils, ListUtils, MetricNumberMode } from '@/utils';
import { SeriesOneResponse } from '@core/domain/Response';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { NumberFormatter, RangeData } from '@core/services/formatter';
import { Log } from '@core/utils';
import { StringUtils } from '@/utils/string.utils';
import { ThemeModule } from '@/store/modules/theme.store';

@Component
@ClassProfiler({ prefix: 'StackingSeriesChart' })
export default class StackingSeriesChart extends BaseHighChartWidget<SeriesOneResponse, StackedVizSetting, StackedQuerySetting> {
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
  setting!: StackedVizSetting;

  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;

  @Prop({ required: true })
  query!: StackedQuerySetting;

  @Ref()
  chart: any;
  // todo: fixme return correct default type
  protected renderController: RenderController<SeriesOneResponse>;

  constructor() {
    super();
    const plotSeriesOptions: Highcharts.PlotSeriesOptions = createPlotOptionsWithRightClickListener(this.showDrilldown);
    const tooltipFormatter = this.tooltipFormatter;
    const dataLabelsFormatter = this.dataLabelsFormatter;
    const manualOptions: Highcharts.Options = {
      chart: {
        type: 'line'
      },
      xAxis: {
        type: 'category'
      },
      colors: this.setting.colors,
      plotOptions: {
        series: {
          ...plotSeriesOptions,
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
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options.metricNumbers ?? MetricNumberMode.Default);
    this.renderController = this.createRenderController();
  }

  private dataLabelsFormatter(point: Highcharts.PointLabelObject): string {
    const formattedData = this.numberFormatter.format(point.y ?? 0);
    const textColor = this.setting.options.textColor;
    return `<div style="color:${textColor}">${formattedData}</div>`;
  }

  private tooltipFormatter(contextObject: TooltipFormatterContextObject) {
    //@ts-ignore
    const textColor = this.setting?.options?.tooltip?.style?.color ?? '#fff';
    //@ts-ignore
    const fontFamily = this.setting?.options?.tooltip?.style?.fontFamily ?? 'Barlow';
    let result = '';
    if (contextObject.points) {
      contextObject.points.forEach(point => {
        const formattedData = this.numberFormatter.format(point.y);
        result = result + `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${formattedData}</b><br/>`;
      });
    }
    return `<div style="color: ${textColor}; font-family: ${fontFamily}; text-align: left">
                ${result}
            </div>`;
  }

  private buildFormatterByMetricNumber(metricNumber: MetricNumberMode) {
    const metricNumbers = HighchartUtils.toMetricNumbers(metricNumber);
    const ranges: RangeData[] | undefined = HighchartUtils.buildRangeData(metricNumbers);
    return new NumberFormatter(ranges);
  }

  private createRenderController(): RenderController<SeriesOneResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
  }

  private get cloneChartData() {
    return SeriesOneResponse.fromObject(this.data);
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

  updateSeriesStacking(stackingGroup: DIMap<string>) {
    if (stackingGroup) {
      const chart = this.chart.getChart();
      Object.keys(stackingGroup).forEach(k => {
        const series: Highcharts.Series = chart.series[+k];
        if (series) {
          series.update(
            {
              type: series.type as any,
              stack: stackingGroup[+k] as any
            },
            false
          );
        }
      });
    }
  }

  updateOptions(newOptions: any) {
    this.options = merge({}, VizSetting.CONFIG, StackedVizSetting.DEFAULT_SETTING, this.options, newOptions);
  }

  isHorizontalZoomIn(): boolean {
    // const currentZoomFn: string | undefined = ZoomModule.zoomDataAsMap.get(+this.id)?.currentHorizontalLevel;
    // if (currentZoomFn) {
    //   const currentZoomLvlIndex: number | undefined = ZoomModule.zoomLevelsAsMap.get(currentZoomFn);
    //   if (currentZoomLvlIndex != undefined) {
    //     const lastZoomFn: string | undefined = ZoomModule.zoomNodes[currentZoomLvlIndex].slice(-1)[0];
    //     return lastZoomFn != undefined && currentZoomFn != lastZoomFn;
    //   }
    //   return false;
    // }
    return false;
  }

  isHorizontalZoomOut(): boolean {
    // const currentZoomFn: string | undefined = ZoomModule.zoomDataAsMap.get(+this.id)?.currentHorizontalLevel;
    // if (currentZoomFn) {
    //   const currentZoomLvlIndex: number | undefined = ZoomModule.zoomLevelsAsMap.get(currentZoomFn);
    //   if (currentZoomLvlIndex != undefined) {
    //     const firstZoomFn: string | undefined = ZoomModule.zoomNodes[currentZoomLvlIndex][0];
    //     return firstZoomFn != undefined && currentZoomFn != firstZoomFn;
    //   }
    //   return false;
    // }
    return false;
  }

  protected getChart(): Highcharts.Chart | undefined {
    return this.chart?.getChart();
  }

  protected buildHighchart() {
    try {
      this.updateMetricNumber(this.setting.options);
      HighchartUtils.reset(this.getChart());
      this.buildDualAxis(this.data, this.setting.options);
      this.load(this.data, this.setting);
      this.buildAxis(this.data);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`SeriesChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  protected buildAxis(data: SeriesOneResponse) {
    const options: any = {};
    if (ListUtils.isNotEmpty(data.xAxis)) {
      options['xAxis'] = {
        // type: 'category',
        categories: data.xAxis
      };
    }
    if (ListUtils.isNotEmpty(data.yAxis)) {
      options['yAxis'][0] = [
        {
          type: 'category',
          categories: data.yAxis
        }
      ];
    }
    HighchartUtils.updateChart(this.getChart(), options);
  }

  protected load(chartData: SeriesOneResponse, setting: StackedVizSetting) {
    const { stackingGroup, seriesTypesByLabelMap } = setting;
    Log.debug('load::Stacking group', stackingGroup, '::series types', seriesTypesByLabelMap);
    const seriesWithType = chartData.series.map(item => {
      const normalizedLabel = StringUtils.toCamelCase(item.name);
      const type = seriesTypesByLabelMap.get(normalizedLabel);
      const stackGroup = stackingGroup.get(normalizedLabel);
      Log.debug('load::', item.name, '=>', normalizedLabel, `={${type}, ${stackGroup}}`);
      return {
        ...item,
        type: type,
        stack: stackGroup
      };
    });
    HighchartUtils.addSeries(this.getChart(), seriesWithType);
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
    //     xAxis: {
    //       title: {
    //         style: newStyle
    //       },
    //       labels: {
    //         style: newStyle
    //       }
    //     },
    //     yAxis: [
    //       {
    //         title: {
    //           style: newStyle
    //         },
    //         labels: {
    //           style: newStyle
    //         }
    //       }
    //     ],
    //     plotOptions: {
    //       series: {
    //         dataLabels: {
    //           style: newStyle
    //         }
    //       }
    //     }
    //   };
    //   HighchartUtils.updateChart(this.getChart(), newColorOption, reDraw);
    // }
  }

  private setSeriesToPrimaryAxis(chartData: SeriesOneResponse) {
    chartData.series.forEach(series => (series.yAxis = 0));
  }

  private deleteDualAxis() {
    this.getChart()
      ?.get('dual-axis')
      ?.remove();
  }

  private buildDualAxis(chartData: SeriesOneResponse, options: any) {
    if (options?.dualAxis != undefined) {
      const hasDualAxis = options.dualAxis != -1;
      if (hasDualAxis) {
        chartData.series[options.dualAxis].yAxis = 1;
        options.yAxis[1].title = {
          text: chartData.series[options.dualAxis].name
        };
      } else {
        const existDualAxis = this.getChart()?.yAxis?.length == 2;
        if (existDualAxis) {
          this.setSeriesToPrimaryAxis(chartData);
          this.deleteDualAxis();
        }
      }
    }
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

  private showDrilldown(mouseEventData: MouseEventData<Point>) {
    mouseEventData.event.preventDefault();
    Log.debug('showDrilldown::at', mouseEventData.event.clientX, mouseEventData.event.clientY, mouseEventData.data);
    const mouseEventDataAString = new MouseEventData<string>(mouseEventData.event, mouseEventData.data.category);
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.id, mouseEventDataAString);
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
