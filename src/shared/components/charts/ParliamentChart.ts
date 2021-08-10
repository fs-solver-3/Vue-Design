/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 3:01 PM
 */

import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { BaseHighChartWidget, MouseEventData } from '@chart/BaseChart';
import { DIException, ParliamentDisplayType, ParliamentQuerySetting, ParliamentVizSetting, SeriesTwoResponse, ThemeColor, VizSetting } from '@core/domain';
import { RenderController } from '@chart/custom/RenderController';
import Highcharts, { Point, Series } from 'highcharts';
import { isNumber, merge } from 'lodash';
import { HighchartUtils, MetricNumberMode } from '@/utils';
import { NumberFormatter, RangeData } from '@core/services';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { InvalidDataException } from '@core/domain/Exception/InvalidDataException';
import { Log } from '@core/utils';
import { DataLabelFormatterMode } from '@chart/PieChart';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { ThemeModule } from '@/store/modules/theme.store';

@Component
@ClassProfiler({ prefix: 'ParliamentChart' })
export default class ParliamentChart extends BaseHighChartWidget<SeriesTwoResponse, ParliamentVizSetting, ParliamentQuerySetting> {
  private static DISPLAY_AS_CIRCLE_OPTIONS = {
    center: ['50%', '50%'],
    size: '100%',
    startAngle: 0,
    endAngle: 360
  };
  private static DISPLAY_AS_RECTANGLE_OPTIONS = {
    startAngle: null,
    endAngle: null
  };
  private static DISPLAY_AS_PARLIAMENT_OPTIONS = {
    center: ['50%', '65%'],
    size: '100%',
    startAngle: -100,
    endAngle: 100
  };
  @Ref()
  chart: any;
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
  setting!: ParliamentVizSetting;
  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;
  @Prop({ required: true })
  query!: ParliamentQuerySetting;
  // todo: fixme return correct default type
  protected renderController: RenderController<SeriesTwoResponse>;
  private numberFormatter!: NumberFormatter;

  constructor() {
    super();
    const manualOptions: Highcharts.Options = this.getDefaultOptions();
    this.options = merge({}, VizSetting.CONFIG, ParliamentVizSetting.DEFAULT_SETTING, this.options, manualOptions);
    this.renderController = this.createRenderController();
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options.metricNumbers ?? MetricNumberMode.Default);
  }

  @Watch('subTitle')
  onSubtitleChanged() {
    if (this.isCustomDisplay()) {
      this.buildCustomChart();
    } else {
      this.updateChartInfo();
    }
  }

  mounted() {
    this.reRenderChart();
  }

  beforeDestroy() {
    this.renderController.dispose();
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

  isHorizontalZoomIn(): boolean {
    throw new Error('Method not implemented.');
  }

  isHorizontalZoomOut(): boolean {
    throw new Error('Method not implemented.');
  }

  protected buildHighchart() {
    try {
      HighchartUtils.reset(this.getChart());
      this.validateData(this.data, this.setting);
      const series: Series[] = this.load(this.data, this.setting);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
      this.assignRightClick(series);
    } catch (ex) {
      this.handleException(ex);
    }
  }

  protected load(chartData: SeriesTwoResponse, vizSetting: ParliamentVizSetting) {
    const displayOptions = this.getDisplayOptions(vizSetting);
    const series = chartData.series.map(series => {
      return {
        ...series,
        ...displayOptions
      };
    });
    return HighchartUtils.addSeries(this.getChart(), series);
  }

  protected getChart(): Highcharts.Chart | undefined {
    return this.chart.getChart();
  }

  protected buildFormatterByMetricNumber(metricNumber: MetricNumberMode) {
    const metricNumbers = HighchartUtils.toMetricNumbers(metricNumber);
    const ranges: RangeData[] | undefined = HighchartUtils.buildRangeData(metricNumbers);
    return new NumberFormatter(ranges);
  }

  protected createRenderController(): RenderController<SeriesTwoResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
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
    //       item: {
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

  private getDefaultOptions(): Highcharts.Options {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    return {
      chart: {
        type: 'item'
      },
      colors: this.setting.colors,
      // tooltip: {
      //   pointFormat: '{point.series.name}: <b>{point.y}</b>'
      // },
      tooltip: {
        useHTML: true,
        formatter: function() {
          return that.tooltipFormatter((this as any) as Highcharts.TooltipFormatterContextObject);
        }
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },

      plotOptions: {
        item: {
          dataLabels: {
            useHTML: true,
            formatter: function() {
              return that.dataLabelsFormatter((this as any) as Highcharts.PointLabelObject);
            }
          }
        },
        series: {
          dataLabels: {
            enabled: true
          }
        }
      }
    };
  }

  private validateData(data: SeriesTwoResponse, setting: ParliamentVizSetting) {
    const maxDataPoint: number = setting.getMaxDataPoint();
    for (let index = 0; index < data.series.length; ++index) {
      const series = data.series[index];
      for (let dataIndex = 0; dataIndex < series.data.length; ++dataIndex) {
        const data = series.data[dataIndex];
        const pointValue = data[1];
        if (isNumber(pointValue) && pointValue > maxDataPoint) {
          throw new InvalidDataException(`Parliament can not render quantity point greater ${maxDataPoint}, change in setting`);
        }
      }
    }
  }

  private handleException(ex: any) {
    if (InvalidDataException.isInvalidDataException(ex)) {
      throw ex;
    } else {
      Log.debug('handleException::', ex);
      throw new DIException('Error when display chart. Please try again!');
    }
  }

  private getDisplayOptions(vizSetting: ParliamentVizSetting): any {
    switch (vizSetting.getDisplayType()) {
      case ParliamentDisplayType.Circle:
        return ParliamentChart.DISPLAY_AS_CIRCLE_OPTIONS;
      case ParliamentDisplayType.Rectangle:
        return ParliamentChart.DISPLAY_AS_RECTANGLE_OPTIONS;
      default:
        return ParliamentChart.DISPLAY_AS_PARLIAMENT_OPTIONS;
    }
  }

  private dataLabelsFormatter(point: Highcharts.PointLabelObject): string {
    const dataLabelsMode: DataLabelFormatterMode = this.setting.options?.plotOptions?.item?.dataLabels?.labelFormat ?? DataLabelFormatterMode.NameAndValue;
    const textColor = this.setting.options?.plotOptions?.item?.dataLabels?.style?.color ?? '#fff';
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
    const dataFormatted = Math.round(point.percentage);
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

  private tooltipFormatter(contextObject: Highcharts.TooltipFormatterContextObject): string {
    const formattedData = this.numberFormatter.format(contextObject.y ?? 0);
    //@ts-ignore
    const textColor = this.setting?.options?.tooltip?.style?.color ?? '#fff';
    //@ts-ignore
    const fontFamily = this.setting?.options?.tooltip?.style?.fontFamily ?? 'Barlow';
    return `<div style="text-align: left; color: ${textColor}; font-family: ${fontFamily}">
                <span style="font-size: 10px;">${contextObject.key}</span></br>
                ${contextObject.series.name}: ${formattedData}
            </div>`;
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
