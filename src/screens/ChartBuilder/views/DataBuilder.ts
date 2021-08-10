/*
 * @author: tvc12 - Thien Vi
 * @created: 6/3/21, 5:16 PM
 */

import { Component, Ref, Vue } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router/types/router';
import { Inject } from 'typescript-ioc';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';
import { Routers } from '@/shared/enums/routers.enum';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import { BuilderMode, ConditionData, DataBuilderConstantsV35, FunctionData, VisualizationItemData } from '@/shared';
import BuilderComponents from '@/shared/components/builder';

import DatabaseListing from '@/screens/ChartBuilder/components/DatabaseListing/DatabaseListing.vue';
import FilterPanel from '@/screens/ChartBuilder/components/FilterPanel/FilterPanel.vue';
import ConfigPanel from '@/screens/ChartBuilder/components/ConfigPanel/ConfigPanel.vue';
import VizPanel from '@/screens/ChartBuilder/components/VizPanel/VizPanel.vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import { QueryRelatedWidget, Widget, WidgetExtraData, WidgetId } from '@core/domain/Model';
import { DIException } from '@core/domain/Exception';
import { TabItem } from '@/shared/models';
import { GeolocationModule } from '@/store/modules/data_builder/geolocation.store';
import { Log } from '@core/utils';
import VizSettingModal from '@/screens/ChartBuilder/components/VizSettingModal.vue';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import { VizSettingModule } from '@/store/modules/data_builder/viz_setting.store';
import LocationNormalizeModal from '@/screens/ChartBuilder/components/MatchingLocationModal.vue';
import { DashboardModule } from '@/screens/DashboardDetail/stores';
import { PopupUtils } from '@/utils/popup.utils';
import VisualizeSelectionModal from '@/screens/ChartBuilder/components/VisualizeSelectionModal.vue';
import { DefaultSettingBloc, SettingBloc, SettingState } from '@/screens/ChartBuilder/SettingBloc';
import { VizSettingDataChanged } from '@/screens/ChartBuilder/SettingBloc/State/VizSettingDataChanged';
import Settings from '@/shared/Settings/Common/install';

Vue.use(BuilderComponents);
Vue.use(Settings);
@Component({
  components: {
    FilterPanel,
    DatabaseListing,
    ConfigPanel,
    VizPanel,
    VizSettingModal,
    LocationNormalizeModal,
    VisualizeSelectionModal
  }
})
export default class DataBuilder extends Vue {
  @Ref()
  vizPanel!: VizPanel;
  @Ref()
  settingModal!: VizSettingModal;
  settingBloc: SettingBloc = new DefaultSettingBloc();
  private readonly allItems: VisualizationItemData[] = [...DataBuilderConstantsV35.ALL_CHARTS, ...DataBuilderConstantsV35.ALL_FILTERS];
  private isDragging = false;
  private isShowSelection = false;
  @Inject
  private dataManager!: DataManager;

  private get dashboardId(): string {
    return this.dataManager.getDashboardId()!;
  }

  private get builderMode(): BuilderMode {
    return this.dataManager.getChartBuilderMode();
  }

  private get widgetFromDataManager(): Widget | undefined {
    return this.dataManager.getWidget();
  }

  private get isCreateMode(): boolean {
    return this.builderMode == BuilderMode.create;
  }

  private get chartId(): WidgetId {
    const widget = this.dataManager.getWidget();
    if (widget) {
      return widget.id;
    } else {
      return -1;
    }
  }

  private get isDisableButtonAddOrUpdate(): boolean {
    return VisualizationStoreModule.isQuerySettingExisted || VisualizationStoreModule.hasError;
  }

  private get btnStyle(): CSSStyleDeclaration {
    if (this.isDisableButtonAddOrUpdate) {
      return {
        pointerEvents: 'none',
        opacity: 0.5
      } as any;
    } else {
      return {} as any;
    }
  }

  private get isShowSetting(): boolean {
    return DataBuilderModule.isShowingSetting;
  }

  private get isShowLocationNormalize(): boolean {
    return DataBuilderModule.isShowLocationNormalize;
  }

  created() {
    // TODO: work around: use store cache getter and setter bloc
    QueryBuilderStoreModule.setSettingBloc = this.setSettingBloc;
    QueryBuilderStoreModule.getSettingBloc = this.getSettingBloc;

    this.initData();
  }

  mounted() {
    document.documentElement.classList.add('root-dashboard-theme');
  }

  private setSettingBloc(bloc: SettingBloc) {
    this.settingBloc = bloc;
  }
  private getSettingBloc() {
    return this.settingBloc;
  }

  beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext<any>) {
    next();

    const dataManager: DataManager = DI.get(DataManager);
    const dashboardId = dataManager.getDashboardId();
    if (!dashboardId) {
      next({ name: Routers.mydata });
    } else {
      DashboardModule.loadThemeFromLocal(+dashboardId);
    }
  }

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext<any>) {
    document.documentElement.classList.remove('root-dashboard-theme');
    if (await DataBuilderModule.confirmBack()) {
      next();
      this.clearData();
    } else {
      next(false);
    }
  }

  private clearData() {
    const dataManager: DataManager = DI.get(DataManager);

    dataManager.removeDashboard();
    dataManager.removeWidget();
    dataManager.removeChartBuilderMode();
    dataManager.removeDbHighestUsed();
    DataBuilderModule.reset();
    QueryBuilderStoreModule.reset();
    // VisualizationStoreModule.reset();
    GeolocationModule.reset();
    VizSettingModule.reset();
  }

  private async initData() {
    await GeolocationModule.loadGeolocationMap();
    if (this.widgetFromDataManager) {
      await QueryBuilderStoreModule.initState(this.widgetFromDataManager);
      VizSettingModule.loadSettingTabs(QueryBuilderStoreModule.defaultTabItems);
      // Fixme: update here
      await DataBuilderModule.renderAndSaveSetting(true);
      this.vizPanel.setTabItems(QueryBuilderStoreModule.defaultTabItems);
      if (QueryBuilderStoreModule.defaultCustomChart) {
        this.vizPanel.setCustomChartData(QueryBuilderStoreModule.defaultCustomChart);
      }
      await DatabaseSchemaModule.loadAllDatabaseInfos();
    } else {
      QueryBuilderStoreModule.initDefaultState();
      this.isShowSelection = true;
      await DatabaseSchemaModule.loadAllDatabaseInfos();
      await this.handleSelectDatabase();
    }
  }

  private async handleSelectDatabase() {
    const dbHighestUsed: string | null = this.dataManager.getDbHighestUsed();
    if (dbHighestUsed) {
      await DatabaseSchemaModule.selectDatabase(dbHighestUsed);
    } else {
      await DatabaseSchemaModule.handleSelectDefaultDatabase();
    }
  }

  private handleItemSelected(item: VisualizationItemData) {
    this.isShowSelection = false;
    DataBuilderModule.selectVisualization(item);
  }

  private async handleCancel() {
    const dashboardId: string | undefined = this.dashboardId;
    if (dashboardId) {
      await this.navigateToDashboard(dashboardId);
    } else {
      this.handleError(new DIException("Can't back to dashboard"));
    }
  }

  private async handleAddToDashboard() {
    if (this.isDisableButtonAddOrUpdate) {
      return;
    }
    const dashboardId: string | undefined = this.dashboardId;
    const widget: Widget | null = this.getWidget();

    if (dashboardId && widget) {
      DashboardModule.setWidgetWillAddToDashboard(widget);
      await this.navigateToDashboard(dashboardId);
    } else {
      // TODO: handle
      this.handleError(new DIException("Can't add chart to dashboard"));
    }
  }

  private async handleUpdateChart() {
    if (this.isDisableButtonAddOrUpdate) {
      return;
    }
    const dashboardId: string | undefined = this.dashboardId;
    const widget: Widget | null = this.getWidget();

    if (widget && dashboardId) {
      DashboardModule.setWidgetWillUpdate(widget);
      await this.navigateToDashboard(dashboardId);
    } else {
      this.handleError(new DIException("Can't update chart"));
    }
  }

  private getWidget(): Widget | null {
    const widget: QueryRelatedWidget | null = VisualizationStoreModule.finalWidget;
    if (widget) {
      widget.id = this.chartId;
      widget.extraData = this.getExtraData();
    }
    return widget;
  }

  private getExtraData(): WidgetExtraData | undefined {
    const configs: Record<string, FunctionData[]> = Object.fromEntries(QueryBuilderStoreModule.configsAsMap);
    const filters: Record<string, ConditionData[]> = Object.fromEntries(QueryBuilderStoreModule.filterAsMap);
    const tabItems: TabItem[] = DataBuilderModule.currentSetting;
    return {
      configs: configs,
      filters: filters,
      tabItems: tabItems,
      currentChartType: QueryBuilderStoreModule.chartType
    };
  }

  private handleError(ex: any): void {
    const exception = DIException.fromObject(ex);
    Log.error('ChartPreview::', exception.message);
    PopupUtils.showError(exception.message);
  }

  private navigateToDashboard(dashboardId: string) {
    DataBuilderModule.setAllowBack(true);
    return this.$router.replace({
      name: Routers.dashboardDetail,
      params: {
        dashboardId: dashboardId
      },
      query: this.$route.query
    });
  }

  private async handleOnStateChanged(state: SettingState) {
    Log.debug('handleOnStateChanged::', state);
    switch (state.constructor) {
      case VizSettingDataChanged: {
        await this.handleOnSettingChanged(state as VizSettingDataChanged);
        break;
      }
    }
  }

  private async handleOnSettingChanged(state: VizSettingDataChanged) {
    VizSettingModule.setVizSettingData(state.vizSettingData);
    await DataBuilderModule.applySetting();
    if (state.canQuery) {
      await QueryBuilderStoreModule.renderPreviewWidget(true);
    }
  }
}
