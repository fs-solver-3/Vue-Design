import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores, WidgetType } from '@/shared';
import { ChartSettingUtils, ChartUtils } from '@/utils';
import { SettingItem, TabItem } from '@/shared/models';
import { JsonUtils, Log } from '@core/utils';
import { VisualizationResponse } from '@core/domain/Response';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { DIException } from '@core/domain/Exception';
import { cloneDeep } from 'lodash';
import { DI } from '@core/modules';
import { VizSetting, VizSettingData } from '@core/domain/Model';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import { PanelSettingResolver, VizSettingResolver } from '@/shared/Resolver';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ALL_SETTINGS = require('@/shared/constants/chart_setting_data.json');

@Module({ store: store, name: Stores.vizSetting, dynamic: true, namespaced: true })
class VizSettingStore extends VuexModule {
  private currentVizSettingData: VizSettingData = {};
  /**
   * @deprecated from v1.0.4
   */
  currentSetting: TabItem[] = [];
  /**
   * @deprecated from v1.0.4
   */
  settingAsMap: Map<string, SettingItem> = new Map();
  /**
   * @deprecated from v1.0.4
   */
  private recentSettings: TabItem[] = [];

  /**
   * @deprecated from v1.0.4
   */
  get getTabSettingBy(): (type: string) => any | undefined {
    return type => this.allSettings.vizSettings.find((setting: any) => setting.key === type);
  }

  /**
   * @deprecated from v1.0.4
   */
  private get getDefaultSetting(): (type: string) => TabItem[] {
    return type => ChartUtils.getTabItems(this.allSettings.vizSettings[0], type as WidgetType);
  }

  /**
   * @deprecated from v1.0.4
   */
  private get allSettings(): any {
    // @ts-ignore
    return JsonUtils.fromObject(ALL_SETTINGS);
  }

  @Mutation
  setVizSettingData(vizSettingData: VizSettingData): void {
    this.currentVizSettingData = vizSettingData;
  }

  ///Action
  @Action
  getPreviewVizSetting(): Promise<VizSetting | undefined> {
    const vizSettingResolver: VizSettingResolver = DI.get(VizSettingResolver);
    const currentWidgetType = DataBuilderModule.currentWidgetType;
    // FIXME: remove this, add type to bloc builder change setting
    Log.debug('getPreviewVizSetting::', this.currentVizSettingData);
    switch (currentWidgetType) {
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
      case WidgetType.gauges:
      case WidgetType.wordCloud:
      case WidgetType.treeMap:
      case WidgetType.stackedColumn:
      case WidgetType.stackedBar:
      case WidgetType.funnel:
      case WidgetType.pyramid:
      case WidgetType.pie:
      case WidgetType.histogram:
      case WidgetType.spiderWeb:
      case WidgetType.kpi:
      case WidgetType.tabFilter:
      case WidgetType.heatMap:
      case WidgetType.map:
      case WidgetType.parliament:
        return Promise.resolve(vizSettingResolver.toVizSetting(currentWidgetType, this.currentVizSettingData));
      default: {
        const options: VizSettingData = ChartSettingUtils.getDiSettingOptions(this.currentSetting);
        return Promise.resolve(vizSettingResolver.toVizSetting(currentWidgetType, options));
      }
    }
  }

  ///Mutation
  @Mutation
  // FIXME: will removed
  /**
   * @deprecated from v1.0.4
   * @param type
   */
  buildSetting(type: string) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const tabSetting = VizSettingModule.getTabSettingBy(type);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const newTabItems: TabItem[] = tabSetting ? ChartUtils.getTabItems(tabSetting, type as WidgetType) : VizSettingModule.getDefaultSetting(type);
    this.currentSetting = ChartUtils.keepSettings(newTabItems, this.currentSetting);
    this.settingAsMap = ChartSettingUtils.getSettingAsMap(this.currentSetting);
    this.recentSettings = cloneDeep(this.currentSetting);
    Log.debug('current setting after update: ', this.settingAsMap);
  }

  @Mutation
  loadSettingTabs(tabs: TabItem[]) {
    this.currentSetting = tabs;
    this.settingAsMap = ChartSettingUtils.getSettingAsMap(this.currentSetting);
    this.recentSettings = cloneDeep(tabs);
  }

  @Mutation
  applyPreviewResponseToSetting(response: VisualizationResponse) {
    try {
      if (VisualizationStoreModule.finalQuerySetting && VisualizationStoreModule.finalVizSetting) {
        const settingResolver: PanelSettingResolver = DI.get(PanelSettingResolver);
        const settingTabs: TabItem[] = settingResolver.onResponseChanged(this.currentSetting, {
          response: response,
          setting: VisualizationStoreModule.finalVizSetting,
          query: VisualizationStoreModule.finalQuerySetting,
          widgetType: QueryBuilderStoreModule.itemSelected.type as WidgetType
        });
        this.currentSetting = cloneDeep(settingTabs);
        this.settingAsMap = ChartSettingUtils.getSettingAsMap(this.currentSetting);
        this.recentSettings = cloneDeep(settingTabs);
      }
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.debug(e);
        throw new DIException('Error when apply new data.');
      }
    }
  }

  @Mutation
  updateSettingItem(payload: { settingKey: string; value: any }) {
    Log.debug('updateSettingItem', payload, this.settingAsMap.get(payload.settingKey));
    const { settingKey, value } = payload;
    const setting = this.settingAsMap.get(settingKey);
    if (setting) {
      setting.value = value;
    }
  }

  @Mutation
  resetTabItems() {
    Log.debug('recent setting', this.recentSettings[0]);
    this.currentSetting = cloneDeep(this.recentSettings);
    this.settingAsMap = ChartSettingUtils.getSettingAsMap(this.currentSetting);
  }

  @Mutation
  saveSetting() {
    this.recentSettings = cloneDeep(this.currentSetting);
  }

  @Mutation
  reset() {
    this.currentSetting = [];
  }
}

export const VizSettingModule = getModule(VizSettingStore);
