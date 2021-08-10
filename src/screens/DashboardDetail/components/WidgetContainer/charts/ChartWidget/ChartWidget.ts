import { ChartInfo, PivotTableVizSetting, QuerySettingType, TableVizSetting, VizSetting, VizSettingType, WidgetId } from '@core/domain/Model';
import { VisualizationResponse } from '@core/domain/Response';
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import ZoomControlBar from '@/screens/DashboardDetail/components/WidgetContainer/charts/ZoomControlBar/ZoomControlBar.vue';
import { TimeoutUtils } from '@/utils';
import EmptyWidget from '@/screens/DashboardDetail/components/WidgetContainer/charts/ErrorDisplay/EmptyWidget.vue';
import { BaseWidget } from '@/screens/DashboardDetail/components/WidgetContainer/BaseWidget';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { WidgetResizeHandler } from '@/screens/DashboardDetail/intefaces/ResizeWidgetHandler';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import { DIException } from '@core/domain';
import { Log } from '@core/utils';

const DefaultTable = () => import('@chart/Table/DefaultTable/DefaultTable');
const PivotTable = () => import('@chart/Table/PivotTable/PivotTable');
@Component({
  components: {
    StatusWidget,
    ZoomControlBar,
    EmptyWidget
  }
})
export default class ChartWidget extends Vue implements WidgetResizeHandler {
  static readonly components = new Map<string, string>([
    [VizSettingType.SeriesSetting, 'SeriesChart'],
    [VizSettingType.PieSetting, 'PieChart'],
    [VizSettingType.FunnelSetting, 'FunnelChart'],
    [VizSettingType.PyramidSetting, 'PyramidChart'],
    [VizSettingType.ScatterSetting, 'ScatterChart'],
    [VizSettingType.BubbleSetting, 'BubbleChart'],
    [VizSettingType.HeatMapSetting, 'HeatMapChart'],
    [VizSettingType.ParetoSetting, 'ParetoChart'],
    [VizSettingType.BellCurveSetting, 'BellCurveChart'],
    [VizSettingType.DrilldownSetting, 'DrilldownChart'],
    [VizSettingType.DrilldownPieSetting, 'DrilldownPieChart'],
    [VizSettingType.GaugeSetting, 'GaugeChart'],
    [VizSettingType.TreeMapSetting, 'TreeMapChart'],
    [VizSettingType.NumberSetting, 'KPIWidget'],
    [VizSettingType.WordCloudSetting, 'WordCloudChart'],
    [VizSettingType.HistogramSetting, 'HistogramChart'],
    [VizSettingType.DropdownSetting, 'DropdownFilter'],
    [VizSettingType.StackedSeriesSetting, 'StackingSeriesChart'],
    [VizSettingType.TabFilterSetting, 'TabFilter'],
    [VizSettingType.MapSetting, 'MapChart'],
    [VizSettingType.ParliamentSetting, 'ParliamentChart'],
    [VizSettingType.SpiderWebSetting, 'SpiderWebChart'],
    [VizSettingType.BellCurve2Setting, 'BellCurve2Chart']
  ]);

  @Prop({ required: true, type: Object })
  metaData!: ChartInfo;

  @Prop({ required: true, type: Object })
  response!: VisualizationResponse;

  @Prop({ type: Boolean, default: false })
  showEditComponent!: boolean;

  @Ref()
  private widget!: BaseWidget;

  private get setting(): VizSetting | undefined {
    return this.metaData?.setting?.getVisualizationSetting();
  }

  private get toComponent(): string | undefined {
    if (this.setting) {
      return ChartWidget.components.get(this.setting.className);
    }
    return void 0;
  }

  private get componentClass(): string {
    switch (this.setting?.className) {
      case VizSettingType.TabFilterSetting:
        return 'filter-widget-container';
      default:
        return 'chart-widget-container';
    }
  }

  private get isTableChart() {
    return this.setting && (TableVizSetting.isTableSetting(this.setting) || PivotTableVizSetting.isPivotTableSetting(this.setting));
  }

  private get isPreview(): boolean {
    return this.metaData.id === VisualizationStoreModule.PREVIEW_WIDGET_ID;
  }

  private get toTableComponent(): any {
    switch (this.metaData.setting.className) {
      case QuerySettingType.Table:
      case QuerySettingType.GroupedTable:
        return DefaultTable;
      case QuerySettingType.PivotTable:
        return PivotTable;
      default:
        throw new DIException('Unsupported render this table');
    }
  }

  mounted() {
    this.registerEvents();
  }

  registerEvents(): void {
    this.$root.$on(DashboardEvents.resizeWidget, this.handleResize);
  }

  beforeDestroy() {
    this.unregisterEvents();
  }

  unregisterEvents(): void {
    this.$root.$off(DashboardEvents.resizeWidget, this.handleResize);
  }

  handleResize(id: WidgetId): void {
    if (this.metaData.id === id) {
      if (this.widget && this.widget.resize) TimeoutUtils.waitAndExec(null, () => this.widget.resize(), 250);
    }
  }
}
