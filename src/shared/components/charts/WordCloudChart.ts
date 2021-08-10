import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import Highcharts, { Point, Series, TooltipFormatterContextObject } from 'highcharts';
import { ThemeColor, VizSetting, WordCloudQuerySetting, WordCloudVizSetting } from '@core/domain/Model';
import { merge } from 'lodash';
import { BaseHighChartWidget, MouseEventData } from '@chart/BaseChart.ts';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { DIException } from '@core/domain/Exception';
import { WordCloudResponse } from '@core/domain/Response';
import { DomUtils, HighchartUtils, MetricNumberMode } from '@/utils';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { NumberFormatter, RangeData } from '@core/services/formatter';
import { Log } from '@core/utils';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { ThemeModule } from '@/store/modules/theme.store';

@Component
@ClassProfiler({ prefix: 'WordCloudChart' })
export default class WordCloudChart extends BaseHighChartWidget<WordCloudResponse, WordCloudVizSetting, WordCloudQuerySetting> {
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
  data!: WordCloudResponse;
  @Prop({ required: true, type: Object })
  setting!: WordCloudVizSetting;
  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;
  @Prop({ required: true })
  query!: WordCloudQuerySetting;
  @Ref()
  chart: any;
  // todo: fixme return correct default type
  protected renderController: RenderController<WordCloudResponse>;
  private numberFormatter: NumberFormatter;

  constructor() {
    super();
    const tooltipFormatter = this.tooltipFormatter;
    // const showContextMenu = this.showContextMenu;
    const manualOptions: Highcharts.Options = {
      chart: {
        colors: this.setting.colors,
        events: {
          // load: function() {
          //   const chart = this as any;
          //   // DomUtils.bind('chart', chart);
          //   Log.debug('chart::length', chart.series.length)
          //   if (ListUtils.isNotEmpty(chart.series)) {
          //     chart.series[0].points.forEach((point: any) => {
          //       point.graphic.on('contextmenu', function(event: any) {
          //         const data: MouseEventData<Point> = new MouseEventData<Point>(event, point);
          //         showContextMenu(data);
          //       });
          //     });
          //   }
          // },
          addSeries: function(event) {
            const chart = this as any;
            DomUtils.bind('chart', chart);
            Log.debug('chart::length', chart.series.length, chart.series);
            // event.options
          }
        }
      },
      tooltip: {
        useHTML: true,
        formatter: function() {
          return tooltipFormatter((this as any) as Highcharts.TooltipFormatterContextObject);
        }
      }
    } as Highcharts.Options;
    this.updateOptions(manualOptions);
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options.metricNumbers ?? MetricNumberMode.Default);
    this.renderController = this.createRenderController();
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
    this.options = merge({}, VizSetting.CONFIG, WordCloudVizSetting.DEFAULT_SETTING, this.options, newOptions);
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
      HighchartUtils.reset(this.getChart());
      const series: Series[] = this.load(this.data);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
      this.assignRightClick(series);
      // Log.debug('series', series[0].points.length);
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`WordCloudChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  protected load(chartData: WordCloudResponse) {
    return HighchartUtils.addSeries(this.getChart(), [chartData]);
  }

  protected resizeHighchart(): void {
    this.getChart()?.reflow();
  }

  private showContextMenu(mouseEventData: MouseEventData<Point>) {
    mouseEventData.event.preventDefault();
    Log.debug('showDrilldown::at', mouseEventData.event.clientX, mouseEventData.event.clientY, mouseEventData.data);
    const mouseEventDataAString = new MouseEventData<string>(mouseEventData.event, mouseEventData.data.name);
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.id, mouseEventDataAString);
  }

  private tooltipFormatter(contextObject: TooltipFormatterContextObject) {
    const formattedData = this.numberFormatter.format(contextObject.point.options.weight ?? 0);
    const fieldProperty = contextObject.key;
    //@ts-ignore
    const textColor = this.setting?.options?.tooltip?.style?.color ?? '#fff';
    //@ts-ignore
    const fontFamily = this.setting?.options?.tooltip?.style?.fontFamily ?? 'Barlow';
    return `<div style="font-family: ${fontFamily}; color: ${textColor}; text-align: left">
                ${fieldProperty}: <b>${formattedData}</b><br/>
            </div>`;
  }

  private buildFormatterByMetricNumber(metricNumber: MetricNumberMode) {
    const metricNumbers = HighchartUtils.toMetricNumbers(metricNumber);
    const ranges: RangeData[] | undefined = HighchartUtils.buildRangeData(metricNumbers);
    return new NumberFormatter(ranges);
  }

  private createRenderController(): RenderController<WordCloudResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
  }

  private updateTextColor(color: string | undefined, reDraw: boolean): void {
    // if (color) {
    //   const newStyle = {
    //     color: color
    //   };
    //   const newColorOption = {
    //     title: {
    //       style: newStyle
    //     },
    //     subtitle: {
    //       style: newStyle
    //     }
    //   };
    //   HighchartUtils.updateChart(this.getChart(), newColorOption, reDraw);
    // }
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
