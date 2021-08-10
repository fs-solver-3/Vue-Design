/*
 * @author: tvc12 - Thien Vi
 * @created: 1/8/21, 4:50 PM
 */

import { Component, Inject, Prop, Ref, Watch } from 'vue-property-decorator';
import { BaseHighChartWidget, MouseEventData } from '@chart/BaseChart';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { MapItem, MapResponse } from '@core/domain/Response';
import { MapChartVizSetting, MapQuerySetting, VizSetting } from '@core/domain/Model';
import { DIException } from '@core/domain/Exception';
import Highcharts from 'highcharts/highmaps';
import mapInit from 'highcharts/modules/map';
import { merge } from 'lodash';
import { HighchartUtils, ListUtils } from '@/utils';
import { SelectOption } from '@/shared';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { Log } from '@core/utils';
import { DebounceAction } from '@/shared/anotation/DebounceAction';
import { Point, Series } from 'highcharts';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';

mapInit(Highcharts);

@Component
@ClassProfiler({ prefix: 'SeriesChart' })
export default class MapChart extends BaseHighChartWidget<MapResponse, MapChartVizSetting, MapQuerySetting> {
  protected renderController: RenderController<MapResponse>;
  @Prop({ required: true })
  query!: MapQuerySetting;

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
  data!: MapResponse;

  @Prop({ required: true, type: Object })
  setting!: MapChartVizSetting;

  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;

  @Ref()
  chart: any;

  // Inject from ChartContainer.vue
  @Inject({ default: undefined })
  private onCrossFilterChanged?: (values: SelectOption) => void;

  options: any;
  highcharts = Highcharts;

  constructor() {
    super();
    const selectSeriesItem = this.handleSelectSeriesItem;
    const manualOptions = {
      chart: {
        spacing: this.getSpacingOfMap()
      },
      mapNavigation: {
        buttonOptions: {
          align: 'left',
          verticalAlign: 'bottom',
          theme: {
            fill: '#00000033',
            'stroke-width': 0.5,
            stroke: 'var(--transparent)',
            r: 0,
            style: {
              color: '#ffffff'
            },
            states: {
              hover: {
                fill: '#00000033'
              },
              select: {
                stroke: 'var(--transparent)',
                fill: '#00000033'
              }
            }
          }
        }
      },
      plotOptions: {
        series: {
          point: {
            events: {
              click: function() {
                const item: MapItem = MapItem.fromObject((this as any).options);
                selectSeriesItem(item);
              }
            }
          }
        }
      }
    };
    this.updateOptions(manualOptions);
    this.renderController = this.createRenderController();
  }

  private createRenderController(): RenderController<MapResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
  }

  resize(): void {
    this.getChart()?.reflow();
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
    this.handleSwitchRenderer();
    this.$nextTick(() => {
      if (this.isCustomDisplay()) {
        this.buildCustomChart();
      } else {
        this.buildHighchart();
      }
    });
  }

  @Watch('data')
  onChartDataChanged() {
    if (this.isCustomDisplay()) {
      this.buildCustomChart();
    } else {
      this.buildHighchart();
    }
  }

  @Watch('textColor')
  onTextColorChanged() {
    if (this.isCustomDisplay()) {
      this.buildCustomChart();
    } else {
      this.updateTextColor(this.textColor, true);
    }
  }

  mounted() {
    this.buildHighchart();
  }

  updateOptions(newOptions: any) {
    this.options = merge({}, VizSetting.CONFIG, MapChartVizSetting.DEFAULT_SETTING, this.options, newOptions);
  }

  protected getChart(): Highcharts.Chart | undefined {
    return this.chart?.getChart();
  }

  @DebounceAction({ timeDebounce: 100 })
  protected buildHighchart() {
    try {
      HighchartUtils.reset(this.getChart());
      const mapModule = this.loadMapModule(this.setting.options.geoArea);
      const series: Series[] = this.load(mapModule);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
      this.assignRightClick(series);
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`SeriesChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  private loadMapModule(code: string) {
    if (code && code != 'none') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(`@/shared/map/${code}`);
    } else {
      throw new DIException(`Please select map to display!`);
    }
  }

  protected load(map: any) {
    const series = [
      {
        mapData: map,
        data: this.data.data,
        name: this.query.value.name,
        joinBy: ['hc-key', 'code']
      }
    ];
    return HighchartUtils.addSeries(this.getChart(), series);
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

  isHorizontalZoomIn(): boolean {
    return false;
  }

  isHorizontalZoomOut(): boolean {
    return false;
  }

  protected resizeHighchart(): void {
    Log.debug('resizeHighchart in series', this.id);
    this.getChart()?.reflow();
  }

  private updateChartInfo() {
    HighchartUtils.updateChartInfo(this.getChart(), { title: this.title, subTitle: this.subTitle });
  }

  beforeDestroy() {
    this.renderController.dispose();
  }

  handleSelectSeriesItem(value: MapItem) {
    if (this.onCrossFilterChanged && (this.setting.options.isCrossFilter ?? false)) {
      this.onCrossFilterChanged({ id: 0, displayName: value.code, data: value.name });
    }
  }

  private getSpacingOfMap(): number[] {
    if (this.isPreview && ListUtils.isNotEmpty(this.data.unknownData)) {
      return [10, 10, 15 + 48, 10];
    }
    return [10, 10, 15, 10];
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
