/*
 * @author: tvc12 - Thien Vi
 * @created: 11/27/20, 2:23 PM
 */

import { ConditionData, ConfigType, DataBuilderConstantsV35, FunctionData, Stores, VisualizationItemData, VizActionType, WidgetType } from '@/shared';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import {
  AbstractTableQuerySetting,
  ChartInfo,
  CustomChartData,
  HistogramQuerySetting,
  Id,
  MapQuerySetting,
  Position,
  QueryRelatedWidget,
  VizSetting,
  Widget,
  WidgetExtraData
} from '@core/domain/Model';
import { cloneDeep, isNumber } from 'lodash';
import { ChartConfigUtils, ChartUtils, ListUtils } from '@/utils';
import { Container, Inject } from 'typescript-ioc';
import { ConditionResolver } from '@core/services/condition_builder/condition_resolver';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { DIException } from '@core/domain/Exception';
import { ConditionDataUtils, FunctionDataUtils, Log, WidgetUtils } from '@core/utils';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import { TabItem } from '@/shared/models';
import { DefaultHtml } from '@/shared/constants/custom-chart.html';
import { DefaultJs } from '@/shared/constants/custom-chart.js';
import { DefaultCss } from '@/shared/constants/custom-chart.css';
import { GeolocationModule } from '@/store/modules/data_builder/geolocation.store';
import { ZoomModule } from '@/store/modules/zoom.store';
import { WidgetModule } from '@/screens/DashboardDetail/stores/widget/WidgetStore';
import { QuerySettingModule } from '@/screens/DashboardDetail/stores/widget/QuerySettingStore';
import { DashboardControllerModule } from '@/screens/DashboardDetail/stores/controller/DataControllerStore';
import { DrilldownDataStoreModule } from '@/screens/DashboardDetail/stores/widget/DrilldownDataStore';
import { DataModule } from '@/screens/DashboardDetail/stores/controller/DataStore';
import { FunctionConvertResolver } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/FunctionConvertResolver';
import { FunctionConvertorData } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/FunctionConvertor';
import { DisplayTableType } from '@core/domain/Model/VizSetting/Implement/TableVizSetting';
import { QuerySettingResolver } from '@/shared/Resolver/QuerySettingResolver/QuerySettingResolver';
import {
  AddFunction,
  ConvertFunction,
  DefaultSettingBloc,
  RemoveFunction,
  SettingBloc,
  SettingBlocResolver,
  UpdateFunction
} from '@/screens/ChartBuilder/SettingBloc';
import { DI } from '@core/modules';
import { VizSettingModule } from '@/store/modules/data_builder/viz_setting.store';
import { VisualizationResponse } from '@core/domain';

/* eslint @typescript-eslint/no-use-before-define: 0 */

export interface ConfigRequest {
  configType: ConfigType;
  data: FunctionData;
}

export interface ChangeIndexConfig {
  configType: ConfigType;
  configs: FunctionData[];
}

export interface RemoveConfigRequest {
  configType: ConfigType;
  id: Id;
}

export interface AddConfigRequest extends ConfigRequest {
  index?: number;
}

export interface AddFilterRequest {
  data: ConditionData;
  index?: number;
}

const isRenderable = (visualizationAction: VizActionType): boolean => {
  return visualizationAction == VizActionType.auto;
};

@Module({ store: store, name: Stores.queryBuilder, dynamic: true, namespaced: true })
class QueryBuilderStore extends VuexModule {
  static readonly DEFAULT_BINS_NUMBER = '5';
  // state
  configsAsMap: Map<ConfigType, FunctionData[]> = new Map<ConfigType, FunctionData[]>();
  filterAsMap: Map<Id, ConditionData[]> = new Map<Id, ConditionData[]>();
  itemSelected: VisualizationItemData = DataBuilderConstantsV35.ALL_CHARTS[0];
  visualizationAction: VizActionType = VizActionType.auto;
  defaultTabItems: TabItem[] = [];
  lastConfigAsMap: Map<ConfigType, FunctionData[]> = new Map<ConfigType, FunctionData[]>();
  lastItemSelected: VisualizationItemData = DataBuilderConstantsV35.ALL_CHARTS[0];
  displayTableType: DisplayTableType = DisplayTableType.Collapse;
  //TODO: work ground to resolve change bins number
  binsNumber: string = QueryBuilderStore.DEFAULT_BINS_NUMBER;
  // TODO: move this to new store when refactor
  js = '';
  html = '';
  css = '';
  defaultCustomChart: CustomChartData | null = null;
  @Inject
  private readonly conditionBuilder!: ConditionResolver;
  @Inject
  private readonly querySettingResolver!: QuerySettingResolver;

  get chartType(): WidgetType {
    return this.itemSelected.type as WidgetType;
  }

  get canQueryData(): () => boolean {
    return () => this.querySettingResolver.canBuildQuerySetting(this.chartType, this.configsAsMap, this.filterAsMap);
  }

  get getQuerySetting(): () => QuerySetting {
    return () => {
      const querySetting: QuerySetting = this.querySettingResolver.toQuerySetting(this.chartType, this.configsAsMap, this.filterAsMap);
      ///Old
      if (querySetting instanceof AbstractTableQuerySetting) {
        querySetting.changeDisplayType(this.displayTableType);
      } else if (querySetting instanceof HistogramQuerySetting) {
        querySetting.changeBinsNumber(this.binsNumber);
      } else if (querySetting instanceof MapQuerySetting) {
        const normalizedNameMap = cloneDeep(GeolocationModule.locationMatchedAsMap);
        const geoArea = GeolocationModule.areaAsMap.get(GeolocationModule.areaSelected ?? '');
        querySetting.setGeoArea(geoArea);
        querySetting.setNormalizedMap(normalizedNameMap);
      }
      return querySetting;
    };
  }

  private static getFunctionConvertResolver(): FunctionConvertResolver {
    return Container.get(FunctionConvertResolver);
  }

  // getter

  setSettingBloc: (settingBloc: SettingBloc) => void = () => void 0;

  getSettingBloc: () => SettingBloc = () => new DefaultSettingBloc();

  //mutation
  @Action
  reset() {
    this.clearOldData();
    this.initDefaultState();
  }

  @Action
  async initState(chart: Widget): Promise<void> {
    this.initDefaultState();
    if (chart instanceof ChartInfo && chart.extraData) {
      this.setCurrentChartSelected(chart);
      this.setConfigs(chart.extraData);
      this.setFilters(chart.extraData);
      this.setSettings(chart.extraData.tabItems);
      this.setDisplayTableType(ChartUtils.getDisplayTableType(this.defaultTabItems ?? []) ?? DisplayTableType.Collapse);
      this.setBinsNumber(ChartUtils.getBinsNumber(this.defaultTabItems ?? []) ?? QueryBuilderStore.DEFAULT_BINS_NUMBER);
      await GeolocationModule.loadGeolocationFromWidget(chart);
      const vizSetting: VizSetting | undefined = chart.setting.getVisualizationSetting();
      if (vizSetting) {
        // settingBloc.setVizSettingData(vizSetting.options);
        VisualizationStoreModule.setFinalVizSetting(vizSetting);
        VizSettingModule.setVizSettingData(vizSetting.options);
        this.setDefaultCustomChartData({
          html: vizSetting.options.html,
          js: vizSetting.options.js,
          css: vizSetting.options.css
        });
      }
      await this.processDatabaseListing(chart);
    } else {
      Log.debug(`${chart.className} Unsorted visualization`);
      throw new DIException(`${chart.className} Unsorted visualization`);
    }
  }

  @Mutation
  setDefaultCustomChartData(defaultCustomChart: CustomChartData) {
    this.defaultCustomChart = defaultCustomChart;
    this.html = this.defaultCustomChart.html ?? DefaultHtml;
    this.js = this.defaultCustomChart.js ?? DefaultJs;
    this.css = this.defaultCustomChart.css ?? DefaultCss;
  }

  @Mutation
  setSettings(tabItems: TabItem[]) {
    this.defaultTabItems = tabItems.map(tab => TabItem.fromObject(tab));
  }

  @Mutation
  initDefaultState() {
    this.configsAsMap.clear();
    this.filterAsMap.clear();
    this.lastConfigAsMap.clear();
    this.lastItemSelected = this.itemSelected = DataBuilderConstantsV35.ALL_CHARTS[0];
    this.visualizationAction = VizActionType.auto;
    this.defaultTabItems = [];
    this.displayTableType = DisplayTableType.Collapse;
    this.binsNumber = QueryBuilderStore.DEFAULT_BINS_NUMBER;
    this.js = ChartUtils.getDefaultJs(this.itemSelected.type as WidgetType);
    this.css = ChartUtils.getDefaultCss(this.itemSelected.type as WidgetType);
    this.html = ChartUtils.getDefaultHtml(this.itemSelected.type as WidgetType);
    QueryBuilderStoreModule.setSettingBloc(new DefaultSettingBloc());
  }

  @Mutation
  setVisualizationAction(action: VizActionType) {
    this.visualizationAction = action;
  }

  // Config
  @Mutation
  addConfig(payload: AddConfigRequest) {
    const { data, configType, index } = payload;
    const configs: FunctionData[] | undefined = this.configsAsMap.get(configType);
    if (configs) {
      if (isNumber(index)) {
        // insert
        configs.splice(index, 0, data);
      } else {
        configs.push(data);
      }
    } else {
      this.configsAsMap.set(configType, [data]);
    }
    QueryBuilderStoreModule.getSettingBloc().add(new AddFunction(configType, data));
    this.lastConfigAsMap = new Map(this.configsAsMap);
    this.lastItemSelected = this.itemSelected;
  }

  @Mutation
  updateConfig(payload: ConfigRequest) {
    const { data, configType } = payload;
    const configs: FunctionData[] | undefined = this.configsAsMap.get(configType);
    if (configs) {
      const index: number = configs.findIndex(config => config.id === data.id);
      if (index === -1) {
        return;
      }
      const oldFunction: FunctionData = configs[index];
      configs[index] = data;

      QueryBuilderStoreModule.getSettingBloc().add(new UpdateFunction(configType, data, oldFunction));

      QueryBuilderStoreModule.convertFunction({
        currentFunction: data,
        configType: configType,
        oldFunction: oldFunction
      });
    }
    this.lastConfigAsMap = new Map(this.configsAsMap);
    this.lastItemSelected = this.itemSelected;
  }

  @Mutation
  private convertFunction(payload: { configType: ConfigType; currentFunction: FunctionData; oldFunction: FunctionData | undefined }) {
    const convertResolver = QueryBuilderStore.getFunctionConvertResolver();
    const convertData: FunctionConvertorData = {
      mapConfigs: this.configsAsMap,
      itemSelected: this.itemSelected,
      currentConfig: payload.configType,
      currentFunction: payload.currentFunction,
      oldFunction: payload.oldFunction
    };
    if (convertResolver.canConvert(convertData)) {
      this.configsAsMap = convertResolver.convert(convertData);
      QueryBuilderStoreModule.getSettingBloc().add(new ConvertFunction(convertData, this.configsAsMap));
    }
  }

  @Mutation
  removeConfig(payload: RemoveConfigRequest) {
    const { id, configType } = payload;
    const configs: FunctionData[] | undefined = this.configsAsMap.get(configType);
    const removedConfig = configs?.find(item => item.id === id);
    if (configs && removedConfig) {
      const newConfigs = ListUtils.remove(configs, item => item.id === id);
      this.configsAsMap.set(configType, newConfigs);
      QueryBuilderStoreModule.getSettingBloc().add(new RemoveFunction(configType, removedConfig));
    }
    this.lastConfigAsMap = new Map(this.configsAsMap);
    this.lastItemSelected = this.itemSelected;
  }

  @Mutation
  removeFunctionAt(payload: { configType: ConfigType; index: number }): void {
    const { index, configType } = payload;
    const clonedConfigAsMap = cloneDeep(this.configsAsMap);
    const configs: FunctionData[] | undefined = clonedConfigAsMap.get(configType);
    if (configs && configs[index]) {
      const removedConfig = configs[index];
      configs.splice(index, 1);
      clonedConfigAsMap.set(configType, configs);
      this.configsAsMap = clonedConfigAsMap;
      QueryBuilderStoreModule.getSettingBloc().add(new RemoveFunction(configType, removedConfig));
    }
    this.lastConfigAsMap = new Map(this.configsAsMap);
    this.lastItemSelected = this.itemSelected;
  }

  @Mutation
  changeIndex(payload: ChangeIndexConfig) {
    const { configs, configType } = payload;
    this.configsAsMap.set(configType, configs);
    this.lastConfigAsMap = new Map(this.configsAsMap);
    this.lastItemSelected = this.itemSelected;
  }

  @Mutation
  setConfigs(extraData: WidgetExtraData) {
    this.configsAsMap = FunctionDataUtils.toConfigAsMap(extraData.configs);
    this.lastConfigAsMap = new Map(this.configsAsMap);
    this.lastItemSelected = this.itemSelected;
  }

  // Filter
  @Mutation
  addFilter(payload: AddFilterRequest) {
    const { data, index } = payload;
    const groupId: Id = data.groupId;
    const group = this.filterAsMap.get(groupId);
    if (group) {
      if (isNumber(index)) {
        group.splice(index, 0, data);
      } else {
        group.push(data);
      }
    } else {
      this.filterAsMap.set(groupId, [data]);
    }
  }

  @Mutation
  updateFilter(data: ConditionData) {
    const group = this.filterAsMap.get(data.groupId);
    if (group) {
      const currentData: ConditionData | undefined = group.find(item => item.id === data.id);
      if (currentData) {
        Object.assign(currentData, data);
      } else {
        group.push(data);
      }
    } else {
      this.filterAsMap.set(data.groupId, [data]);
    }
  }

  @Mutation
  removeFilter(payload: { id: Id; groupId: Id }) {
    const { id, groupId } = payload;
    const group = this.filterAsMap.get(groupId);
    if (group) {
      const newGroup = ListUtils.remove(group, item => item.id === id);
      if (ListUtils.isEmpty(newGroup)) {
        this.filterAsMap.delete(groupId);
      } else {
        this.filterAsMap.set(groupId, newGroup);
      }
    }
  }

  @Mutation
  setItemSelected(newItemSelected: VisualizationItemData) {
    if (this.lastItemSelected.type === newItemSelected.type) {
      this.configsAsMap = new Map(this.lastConfigAsMap);
    } else {
      this.configsAsMap = ChartConfigUtils.cloneToNewConfig(newItemSelected, this.lastConfigAsMap);
    }
    this.itemSelected = newItemSelected;
    const settingBlocResolver = DI.get(SettingBlocResolver);
    const settingBloc = settingBlocResolver.createBlocFromBloc({
      selectVizItem: newItemSelected,
      oldBloc: QueryBuilderStoreModule.getSettingBloc()
    });
    //TODO:add type to bloc builder change setting
    switch (newItemSelected.type) {
      case WidgetType.table:
      case WidgetType.pivotTable:
      case WidgetType.bar:
      case WidgetType.column:
      case WidgetType.area:
      case WidgetType.line:
      case WidgetType.scatter:
      case WidgetType.bubble:
      case WidgetType.pareto:
      case WidgetType.bellCurve:
      case WidgetType.wordCloud:
      case WidgetType.treeMap:
      case WidgetType.stackedLine:
      case WidgetType.stackedColumn:
      case WidgetType.gauges:
      case WidgetType.pyramid:
      case WidgetType.pie:
      case WidgetType.funnel:
      case WidgetType.kpi:
      case WidgetType.spiderWeb:
      case WidgetType.histogram:
      case WidgetType.tabFilter:
      case WidgetType.map:
      case WidgetType.heatMap:
      case WidgetType.parliament: {
        const vizSetting = settingBloc.getVizSetting();
        VisualizationStoreModule.saveVizSetting(vizSetting);
      }
    }
    QueryBuilderStoreModule.setSettingBloc(settingBloc);

    this.html = ChartUtils.getDefaultHtml(newItemSelected.type as WidgetType);
    this.js = ChartUtils.getDefaultJs(newItemSelected.type as WidgetType);
    this.css = ChartUtils.getDefaultCss(newItemSelected.type as WidgetType);
  }

  //Action
  @Action
  async buildQueryAndRenderVizPanel(forceRender = false): Promise<void> {
    if (forceRender || isRenderable(this.visualizationAction)) {
      this.clearOldData();
      if (this.canQueryData()) {
        try {
          const querySetting: QuerySetting = this.getQuerySetting();
          VisualizationStoreModule.setPreviewQuerySetting(querySetting);
          const previewWidget: QueryRelatedWidget | null = VisualizationStoreModule.finalWidget;
          if (previewWidget) {
            const response = await this.render(previewWidget);
            QueryBuilderStoreModule.getSettingBloc().changeResponse(response, querySetting);
          }
        } catch (e) {
          Log.debug('renderVisualizationPanel::ex', e.message);
        }
      }
    }
  }

  @Action
  async renderPreviewWidget(forceRender = false): Promise<void> {
    if (forceRender || isRenderable(this.visualizationAction)) {
      if (this.canQueryData()) {
        try {
          const querySetting: QuerySetting = this.getQuerySetting();
          VisualizationStoreModule.setPreviewQuerySetting(querySetting);
          const previewWidget: QueryRelatedWidget | null = VisualizationStoreModule.previewWidget;
          if (previewWidget) {
            const response = await this.render(previewWidget);
            this.getSettingBloc().changeResponse(response, querySetting);
          }
        } catch (e) {
          Log.debug('renderVisualizationPanel::ex', e.message);
        }
      }
    }
  }

  @Mutation
  clearOldData(): void {
    VisualizationStoreModule.clearPreviewQuerySetting();
    DataModule.reset();
    ZoomModule.reset();
    DrilldownDataStoreModule.reset();
    QuerySettingModule.reset();
    WidgetModule.deleteWidget({ id: VisualizationStoreModule.PREVIEW_WIDGET_ID });
  }

  @Action
  async render(previewWidget: QueryRelatedWidget): Promise<VisualizationResponse> {
    ZoomModule.loadZoomLevels([previewWidget]);
    ZoomModule.registerZoomData(previewWidget);
    WidgetModule.addWidget({
      widget: previewWidget,
      position: Position.default()
    });
    QuerySettingModule.setQuerySetting({ id: previewWidget.id, query: previewWidget.setting });
    await DashboardControllerModule.renderChartOrFilter({ widget: previewWidget, forceFetch: true });
    return DataModule.chartDataResponses[previewWidget.id];
  }

  @Mutation
  setDisplayTableType(displayTableType: DisplayTableType) {
    this.displayTableType = displayTableType;
  }

  @Mutation
  setBinsNumber(value: string) {
    this.binsNumber = value;
  }

  @Mutation
  resetBinsNumber() {
    this.binsNumber = QueryBuilderStore.DEFAULT_BINS_NUMBER;
  }

  @Mutation
  setCustomCode(customChartData: CustomChartData) {
    this.js = customChartData.js ?? '';
    this.html = customChartData.html ?? '';
    this.css = customChartData.css ?? '';
  }

  @Mutation
  private setFilters(extraData: WidgetExtraData) {
    this.filterAsMap = ConditionDataUtils.toFilters(extraData.filters);
  }

  @Mutation
  private setCurrentChartSelected(widget: ChartInfo) {
    const currentChartType = widget.extraData?.currentChartType ?? '';
    const itemSelected = [...DataBuilderConstantsV35.ALL_CHARTS, ...DataBuilderConstantsV35.ALL_FILTERS].find(chart => chart.type == currentChartType);
    if (itemSelected) {
      this.itemSelected = itemSelected;
      const settingBlocResolver = DI.get(SettingBlocResolver);
      const settingBloc = settingBlocResolver.createBlocFromQuery({
        selectVizItem: itemSelected,
        query: widget.setting
      });
      QueryBuilderStoreModule.setSettingBloc(settingBloc);
    }
    this.html = ChartUtils.getDefaultHtml(currentChartType as WidgetType);
    this.js = ChartUtils.getDefaultJs(currentChartType as WidgetType);
    this.css = ChartUtils.getDefaultCss(currentChartType as WidgetType);
  }

  @Action
  private async processDatabaseListing(chart: ChartInfo) {
    const mainDatabase: string | null = WidgetUtils.getMainDatabase([chart]);
    if (mainDatabase) {
      await DatabaseSchemaModule.selectDatabase(mainDatabase);
      DatabaseSchemaModule.collapseAllTable();
      const tablesUsedName = WidgetUtils.getFieldsFromQueryWidgets([chart]).map(fieldUsed => fieldUsed.tblName);
      DatabaseSchemaModule.expandTables(tablesUsedName);
    }
  }
}

export const QueryBuilderStoreModule = getModule(QueryBuilderStore);
