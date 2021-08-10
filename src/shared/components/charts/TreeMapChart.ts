import Highcharts, { Point, Series, TooltipFormatterContextObject } from 'highcharts';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { merge } from 'lodash';
import { BaseHighChartWidget, MouseEventData } from '@chart/BaseChart.ts';
import { ClassProfiler, MethodProfiler } from '@/shared/profiler/annotation';
import { DIException } from '@core/domain/Exception';
import { ThemeColor, TreeMapQuerySetting, TreeMapVizSetting, VizSetting } from '@core/domain/Model';
import { HighchartUtils, ListUtils, MetricNumberMode } from '@/utils';
import { TreeMapResponse } from '@core/domain/Response';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { NumberFormatter, RangeData } from '@core/services/formatter';
import { Log } from '@core/utils';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { ThemeModule } from '@/store/modules/theme.store';
import { DataLabelFormatterMode } from '@chart/PieChart';

@Component
@ClassProfiler({ prefix: 'TreeMapChart' })
export default class TreeMapChart extends BaseHighChartWidget<TreeMapResponse, TreeMapVizSetting, TreeMapQuerySetting> {
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
  data!: TreeMapResponse;

  @Prop({ required: true, type: Object })
  setting!: TreeMapVizSetting;

  @Ref()
  chart: any;
  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;
  @Prop({ required: true })
  query!: TreeMapQuerySetting;

  protected renderController: RenderController<TreeMapResponse>;

  @MethodProfiler({ name: 'cloneChartData' })
  private get cloneChartData() {
    return TreeMapResponse.fromObject(this.data);
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

  @Watch('setting.options.plotOptions.treemap.dataLabels.displayUnit')
  onNumberMetricChanged(newMetricNumberMode: MetricNumberMode) {
    const newMetricNumber: string[] | undefined = HighchartUtils.toMetricNumbers(newMetricNumberMode);
    const newRanges: RangeData[] | undefined = HighchartUtils.buildRangeData(newMetricNumber);
    this.numberFormatter.setRanges(newRanges);
  }

  constructor() {
    super();
    const tooltipFormatter = this.tooltipFormatter;
    const dataLabelsFormatter = this.dataLabelsFormatter;
    const manualOptions = {
      colors: this.setting.colors,
      tooltip: {
        useHTML: true,
        formatter: function() {
          return tooltipFormatter((this as any) as Highcharts.TooltipFormatterContextObject);
        }
      },
      plotOptions: {
        treemap: {
          dataLabels: {
            useHTML: true,
            formatter: function() {
              return dataLabelsFormatter((this as any) as Highcharts.PointLabelObject);
            },
            align: 'center'
          }
        }
      }
    };
    this.updateOptions(manualOptions);
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options.plotOptions?.treemap?.dataLabels?.displayUnit ?? MetricNumberMode.Default);
    this.renderController = this.createRenderController();
  }

  private tooltipFormatter(contextObject: TooltipFormatterContextObject) {
    const formattedData = this.numberFormatter.format(contextObject.point.value ?? 0);
    const fieldProperty = contextObject.key;

    const textColor = this.setting?.options?.tooltip?.style?.color ?? '#fff';
    //@ts-ignore
    const fontFamily = this.setting?.options?.tooltip?.style?.fontFamily ?? 'Barlow';
    return `<div style="color: ${textColor};font-family: ${fontFamily}; text-align: left;">
                ${fieldProperty}: <b>${formattedData}</b><br/>
            </div>`;
  }

  private dataLabelsFormatter(point: Highcharts.PointLabelObject): string {
    const textColor = this.setting.options?.plotOptions?.treemap?.dataLabels?.style?.color ?? '#fff';
    return `<span class="text-truncate" style="color: ${textColor};">${point.key}</span>`;
  }

  private buildFormatterByMetricNumber(metricNumber: MetricNumberMode) {
    const metricNumbers = HighchartUtils.toMetricNumbers(metricNumber);
    const ranges: RangeData[] | undefined = HighchartUtils.buildRangeData(metricNumbers);
    return new NumberFormatter(ranges);
  }

  private createRenderController(): RenderController<TreeMapResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
  }

  mounted() {
    this.reRenderChart();
  }

  updateGroupColor(chartData: TreeMapResponse, colors: string[]) {
    chartData.groupNames?.forEach((_, index) => {
      chartData.data[index].color = ListUtils.getElementCycleList(colors, index);
    });
  }

  toSeries(chartData: TreeMapResponse): any[] {
    const series = [];
    series.push({
      type: 'treemap',
      allowTraversingTree: true,
      turboThreshold: chartData.data.length + 1000,
      data: chartData.data
    });
    return series;
  }

  updateOptions(newOptions: any) {
    this.options = merge({}, VizSetting.CONFIG, TreeMapVizSetting.DEFAULT_SETTING, this.options, newOptions);
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
    return this.chart?.getChart();
  }

  protected buildHighchart() {
    try {
      HighchartUtils.reset(this.getChart());
      this.updateGroupColor(this.data, this.setting.colors);
      const series: Series[] = this.load(this.cloneChartData);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      // this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
      this.assignRightClick(series);
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`HighchartsTreeMapChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  protected load(chartData: TreeMapResponse) {
    const series = this.toSeries(chartData);
    return HighchartUtils.addSeries(this.getChart(), series);
  }

  protected resizeHighchart(): void {
    this.getChart()?.reflow();
  }

  private updateChartInfo() {
    HighchartUtils.updateChartInfo(this.getChart(), { title: this.title, subTitle: this.subTitle });
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

  private get themeColors(): string[] {
    return ThemeModule.paletteColor;
  }

  @Watch('themeColors')
  onThemeColorsChanged(newColors: string[]): void {
    const enableChangeColorByTheme = this.setting.options.themeColor?.enabled ?? true;
    if (enableChangeColorByTheme) {
      this.updateGroupColor(this.data, newColors);
    }
  }

  @Watch('setting.options.themeColor', { deep: true })
  onColorConfigChanged(newConfig: ThemeColor) {
    const enableChangeColorByTheme = newConfig?.enabled ?? true;
    if (enableChangeColorByTheme) {
      this.updateGroupColor(this.data, this.themeColors);
    } else {
      this.updateGroupColor(this.data, newConfig.colors ?? []);
    }
  }
}
