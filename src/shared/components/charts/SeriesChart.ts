import Highcharts, { Point, TooltipFormatterContextObject } from 'highcharts';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { SeriesQuerySetting, SeriesVizSetting, ThemeColor, VizSetting, VizSettingData } from '@core/domain/Model';
import { get, merge } from 'lodash';
import { BaseHighChartWidget, createPlotOptionsWithRightClickListener, MouseEventData } from '@chart/BaseChart.ts';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { DIException } from '@core/domain/Exception';
import { HighchartUtils, ListUtils, MetricNumberMode, ZoomUtils } from '@/utils';
import { SeriesOneResponse } from '@core/domain/Response';
import { CompareMode } from '@core/domain/Request/Query/CompareMode';
import { ZoomModule } from '@/store/modules/zoom.store';
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
@ClassProfiler({ prefix: 'SeriesChart' })
export default class SeriesChart extends BaseHighChartWidget<SeriesOneResponse, SeriesVizSetting, SeriesQuerySetting> {
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
  setting!: SeriesVizSetting;

  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;

  @Prop({ required: true })
  query!: SeriesQuerySetting;

  @Ref()
  chart: any;
  protected renderController: RenderController<SeriesOneResponse>;

  constructor() {
    super();
    const plotSeriesOptions: Highcharts.PlotSeriesOptions = createPlotOptionsWithRightClickListener(this.showContextMenu);
    const dataLabelsFormatter = this.dataLabelsFormatter;
    const tooltipFormatter = this.tooltipFormatter;
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
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options?.plotOptions?.series?.dataLabels?.displayUnit ?? MetricNumberMode.Default);
    this.updateOptions(manualOptions);
    this.renderController = this.createRenderController();
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
    this.options = merge({}, VizSetting.CONFIG, SeriesVizSetting.DEFAULT_SETTING, this.options, newOptions);
  }

  isHorizontalZoomIn(): boolean {
    const currentLvl = ZoomModule.zoomDataAsMap.get(+this.id)?.currentHorizontalLevel;
    const zoomLevel = ZoomUtils.getZoomLevels(ZoomModule.zoomLevelData, currentLvl);
    return ZoomUtils.canZoomIn(zoomLevel, currentLvl);
  }

  isHorizontalZoomOut(): boolean {
    const currentLvl = ZoomModule.zoomDataAsMap.get(+this.id)?.currentHorizontalLevel;
    const zoomLevel = ZoomUtils.getZoomLevels(ZoomModule.zoomLevelData, currentLvl);
    return ZoomUtils.canZoomOut(zoomLevel, currentLvl);
  }

  beforeDestroy() {
    this.renderController.dispose();
  }

  protected getChart(): Highcharts.Chart | undefined {
    return this.chart?.getChart();
  }

  protected buildHighchart(): void {
    try {
      this.updateMetricNumber(this.setting.options);
      HighchartUtils.reset(this.getChart());
      this.buildDualAxis(this.data, this.setting.options);
      if (this.data.haveComparison()) {
        this.loadWithCompareResponse(this.data, this.setting);
      } else {
        this.load(this.data, this.setting);
      }
      this.buildAxis(this.data);

      this.updateChartInfo();

      HighchartUtils.updateChart(this.getChart(), this.setting.options);

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

  protected buildAxis(chartData: SeriesOneResponse) {
    const options: any = {};
    if (ListUtils.isNotEmpty(chartData.xAxis)) {
      options['xAxis'] = {
        // type: 'category',
        categories: chartData.xAxis
      };
    }
    if (ListUtils.isNotEmpty(chartData.yAxis)) {
      options['yAxis'][0] = [
        {
          type: 'category',
          categories: chartData.yAxis
        }
      ];
    }
    if (chartData.haveComparison()) {
      options.plotOptions = {
        series: {
          grouping: false
        }
      };
    }
    HighchartUtils.updateChart(this.getChart(), options);
  }

  protected loadWithCompareResponse(chartData: SeriesOneResponse, setting: SeriesVizSetting): void {
    const compareResponse = chartData.compareResponses?.get(CompareMode.rawValues);
    const series: Record<string, any>[] = [];
    compareResponse?.series.forEach((value, index) => {
      const id = value.name;
      chartData.series[index].id = id;
      value.linkedTo = id;
      value.pointPlacement = -0.2;
      value.color = setting.options.comparisonColor;
      value.yAxis = chartData.series[index].yAxis;
      series.push(value, chartData.series[index]);
    });
    HighchartUtils.addSeries(this.getChart(), series);
  }

  protected load(chartData: SeriesOneResponse, setting: SeriesVizSetting) {
    const { seriesTypesByLabelMap } = setting;
    const seriesWithType = chartData.series
      .sort((legend, nextLegend) => StringUtils.compare(legend.name, nextLegend.name))
      .map(item => {
        const { name } = item;
        const normalizedName = StringUtils.toCamelCase(name);
        const type = seriesTypesByLabelMap.get(normalizedName);
        const itemSetting = get(setting, `options.plotOptions.series.response.${normalizedName}`, {});
        const result = item;
        Object.assign(result, { type: type }, itemSetting);
        //Hot fix lỗi stack sai trong Area:
        //Context: Khi có legend, response trên sever trả về sẽ bao gồm stack trong prop
        //Error: Stack bị chia làm 4 group thay vì 1 Group
        //Giải phạp tạm thời: xoá prop stack và nếu có stack thì sẽ stack thành 1 Group duy nhất
        //Example:
        ///[
        //     {
        //         "name": "Home Office",
        //         "data": [
        //             89133703.2,
        //             596462670.8,
        //             701273231.5
        //         ],
        //============ERROR HERE============
        //         "stack": "Home Office",
        //==================================
        //     },
        //     {
        //         "name": "Consumer",
        //         "data": [
        //             160794807.8,
        //             1295597383,
        //             1628349620.8
        //         ],
        //==================================
        //         "stack": "Consumer",
        //==================================
        //     },
        //     {
        //         "name": "Corporate",
        //         "data": [
        //             174450763.4,
        //             925259129.4,
        //             1015840954
        //         ],
        //============ERROR HERE============
        //         "stack": "Corporate",
        //==================================
        //     },
        //     {
        //         "name": "",
        //         "data": [
        //             null,
        //             -30764.8,
        //             null
        //         ],
        //============ERROR HERE============
        //         "stack": "",
        //==================================
        //     }
        // ]
        result['stack'] = undefined;
        return result;
      });
    HighchartUtils.addSeries(this.getChart(), seriesWithType);
  }

  protected resizeHighchart(): void {
    Log.debug('resizeHighchart in series', this.id);
    this.getChart()?.reflow();
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
    // if (options?.dualAxis != undefined) {
    //   const hasDualAxis = options.dualAxis != -1;
    //   if (hasDualAxis) {
    //     chartData.series[options.dualAxis].yAxis = 1;
    //     options.yAxis[1].title = {
    //       text: chartData.series[options.dualAxis].name
    //     };
    //   } else {
    //     const existDualAxis = this.getChart()?.yAxis?.length == 2;
    //     if (existDualAxis) {
    //       this.setSeriesToPrimaryAxis(chartData);
    //       this.deleteDualAxis();
    //     }
    //   }
    // }
    const oneSeries = ListUtils.hasOnlyOneItem(chartData.series);
    const settingHaveAxis = this.setting.options.yAxis?.length == 2;
    const existDualAxis = this.getChart()?.get('dual-axis') != undefined;
    if (settingHaveAxis && !existDualAxis) {
      // @ts-ignore
      this.getChart()?.addAxis(this.setting.options.yAxis[1] as any, false, false);
    } else if (!settingHaveAxis || oneSeries) {
      Log.debug('delete axis');
      this.setSeriesToPrimaryAxis(chartData);
      this.deleteDualAxis();
    }
  }

  private updateChartInfo() {
    HighchartUtils.updateChartInfo(this.getChart(), { title: this.title, subTitle: this.subTitle });
  }

  private updateMetricNumber(options: VizSettingData) {
    const metrixNumber: string[] | undefined = HighchartUtils.toMetricNumbers(
      options?.plotOptions?.series?.dataLabels?.displayUnit ?? MetricNumberMode.Default ?? MetricNumberMode.Default
    );
    Highcharts.setOptions({
      lang: {
        numericSymbols: metrixNumber
      }
    });
  }

  private showContextMenu(mouseEventData: MouseEventData<Point>) {
    mouseEventData.event.preventDefault();
    const mouseEventDataAString = new MouseEventData<string>(mouseEventData.event, mouseEventData.data.category);
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.id, mouseEventDataAString);
  }

  private buildFormatterByMetricNumber(metricNumber: MetricNumberMode) {
    const metricNumbers = HighchartUtils.toMetricNumbers(metricNumber);
    const ranges: RangeData[] | undefined = HighchartUtils.buildRangeData(metricNumbers);
    return new NumberFormatter(ranges);
  }

  private dataLabelsFormatter(point: Highcharts.PointLabelObject): string {
    const textColor = this.setting.options?.plotOptions?.series?.dataLabels?.style?.color ?? '#fff';
    const formattedData = this.numberFormatter.format(point.y ?? 0);
    return `<div style="color: ${textColor}"> ${formattedData}</div>`;
  }

  private tooltipFormatter(point: TooltipFormatterContextObject) {
    const textColor = this.setting?.options?.tooltip?.style?.color ?? '#fff';
    const fontFamily = this.setting?.options?.tooltip?.style?.fontFamily ?? 'Barlow';
    let result = '';
    if (point.points) {
      point.points.forEach(point => {
        const formattedData = this.numberFormatter.format(point.y);
        result =
          result +
          `<div class="d-flex" style="color: ${textColor}; font-family: ${fontFamily}">
                                <span style="color:${point.color}; padding-right: 5px;">●</span>
                                <div style="color: ${this.setting.options.textColor}">${point.series.name} : ${formattedData}</div>
                           </div> `;
      });
    }
    return result;
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
