import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { Stores, VisualizationItemData, WidgetType } from '@/shared';
import store from '@/store';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import { TabItem } from '@/shared/models';
import { VizSettingModule } from '@/store/modules/data_builder/viz_setting.store';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { DataModule } from '@/screens/DashboardDetail/stores/controller/DataStore';
import { DI } from '@core/modules';
import { PanelSettingResolver } from '@/shared/Resolver';
import { Modals } from '@/utils/modals';

/**
 * Store control tất cả các action trong Data builder page
 */
@Module({ store: store, name: Stores.dataBuilder, dynamic: true, namespaced: true })
class DataBuilderStore extends VuexModule {
  isShowingSetting = false;
  isShowLocationNormalize = false;
  allowBack = false;

  get currentSetting(): TabItem[] {
    return VizSettingModule.currentSetting;
  }

  ///Getter

  get currentWidgetType(): WidgetType {
    return QueryBuilderStoreModule.itemSelected.type as WidgetType;
  }

  private get panelResolver(): PanelSettingResolver {
    return DI.get(PanelSettingResolver);
  }

  ///Action

  @Action
  // Fixme: will remove
  /**
   * @deprecated from v1.0.4
   */
  async selectVisualization(vizItem: VisualizationItemData): Promise<void> {
    DataModule.reset();
    QueryBuilderStoreModule.setItemSelected(vizItem);
    switch (vizItem.type) {
      case WidgetType.pivotTable:
      case WidgetType.table:
        VizSettingModule.setVizSettingData(QueryBuilderStoreModule.getSettingBloc().getVizSettingData());
        break;
      default:
        VizSettingModule.buildSetting(vizItem.type);
    }
  }

  @Action
  async buildQueryAndRenderVizPanel(forceRender = false) {
    await QueryBuilderStoreModule.buildQueryAndRenderVizPanel(forceRender);
    const previewResponse = DataModule.previewResponse;
    if (previewResponse) {
      VizSettingModule.applyPreviewResponseToSetting(previewResponse);
      await this.saveSetting();
      const currentSetting = await VizSettingModule.getPreviewVizSetting();
      return VisualizationStoreModule.saveVizSetting(currentSetting);
    }
  }

  @Action
  async renderAndSaveSetting(forceRender = false) {
    await QueryBuilderStoreModule.buildQueryAndRenderVizPanel(forceRender);
    const previewResponse = DataModule.previewResponse;
    if (previewResponse) {
      await this.saveSetting();
      const currentSetting = await VizSettingModule.getPreviewVizSetting();
      await VisualizationStoreModule.saveVizSetting(currentSetting);
    }
  }

  @Action
  async saveSetting() {
    const currentSetting = await VizSettingModule.getPreviewVizSetting();
    VisualizationStoreModule.setFinalVizSetting(currentSetting);
    VizSettingModule.saveSetting();
  }

  @Action
  async applySetting() {
    const vizSetting = await VizSettingModule.getPreviewVizSetting();
    VisualizationStoreModule.setPreviewVizSetting(vizSetting);
  }

  @Action
  async applyMatchingLocation() {
    this.closeNormalizeModal();
    const previewResponse = DataModule.previewResponse;
    if (previewResponse) {
      await VizSettingModule.applyPreviewResponseToSetting(previewResponse);
      await QueryBuilderStoreModule.buildQueryAndRenderVizPanel(true);
    }
  }

  @Action
  async updateSettingItem(payload: { settingKey: string; value: any }): Promise<void> {
    const { settingKey, value } = payload;
    const isValueChanged = VizSettingModule.settingAsMap.get(settingKey)?.value != value;
    if (isValueChanged) {
      VizSettingModule.updateSettingItem(payload);
      await this.panelResolver.onChangeSetting({
        settingKey: settingKey,
        value: value,
        type: this.currentWidgetType
      });
      await this.applySetting();
    }
  }

  @Action
  async resetSetting() {
    VisualizationStoreModule.setPreviewVizSetting(VisualizationStoreModule.finalVizSetting ?? void 0);
    // QueryBuilderStoreModule.resetBinsNumber();
    VizSettingModule.resetTabItems();
    QueryBuilderStoreModule.setBinsNumber(VizSettingModule.settingAsMap.get('bins_number')?.value ?? 5);
    await QueryBuilderStoreModule.buildQueryAndRenderVizPanel(true);
  }

  @Action
  async confirmBack(): Promise<boolean> {
    return new Promise(resolve => {
      if (this.allowBack) {
        return resolve(true);
      } else {
        Modals.showConfirmationModal('This will end your progress, are you sure you want to go back?', {
          onOk: () => resolve(true),
          onCancel: () => resolve(false)
        });
      }
    });
  }

  @Action
  showSetting() {
    if (VisualizationStoreModule.finalWidget) {
      this.openSettingModal();
    }
  }

  @Action
  closeSetting() {
    this.closeSettingModal();
  }

  /// Location Normalize Modal

  @Action
  showLocationMatchingModal() {
    this.openNormalizeModal();
  }

  @Action
  hideLocationNormalize() {
    this.closeNormalizeModal();
  }

  ///Mutation

  @Mutation
  openSettingModal() {
    this.isShowingSetting = true;
  }

  @Mutation
  closeSettingModal() {
    this.isShowingSetting = false;
  }

  @Mutation
  openNormalizeModal() {
    this.isShowLocationNormalize = true;
  }

  @Mutation
  closeNormalizeModal() {
    this.isShowLocationNormalize = false;
  }

  @Mutation
  reset() {
    // this.isShowLocationNormalize = false;
    this.isShowingSetting = false;
    this.allowBack = false;
  }

  @Mutation
  setAllowBack(value: boolean) {
    this.allowBack = value;
  }
}

export const DataBuilderModule = getModule(DataBuilderStore);
