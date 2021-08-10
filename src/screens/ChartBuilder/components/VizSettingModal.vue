<template>
  <BModal
    id="viz-setting-modal"
    v-model="isShowSync"
    :cancel-disabled="false"
    :hide-footer="true"
    :hide-header="true"
    :no-close-on-backdrop="true"
    :no-close-on-esc="true"
    centered
    class="rounded"
    size="xl"
  >
    <template #default>
      <div class="d-flex flex-row h-100">
        <PreviewPanel :is-edit-mode="true" class="visualization"></PreviewPanel>
        <div class="px-3 py-3 d-flex flex-column setting">
          <div class="setting-header justify-content-between mb-3">
            <DiTitle>Setting</DiTitle>
            <div class="setting-actions d-flex flex-row">
              <DiFlatButton :id="genBtnId('cancel-setting')" title="Cancel" @click="handleCancelSetting" />
              <DiButton :id="genBtnId('save-setting')" class="save-btn btn-primary ml-1" title="Save" @click="handleSaveSetting" />
            </div>
          </div>
          <template v-if="itemSelected === WidgetType.pivotTable">
            <PivotSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.table">
            <TableSetting />
          </template>
          <template
            v-else-if="
              itemSelected === WidgetType.line || itemSelected === WidgetType.column || itemSelected === WidgetType.area || itemSelected === WidgetType.bar
            "
          >
            <SeriesSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.pie">
            <PieSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.pyramid">
            <PyramidSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.funnel">
            <FunnelSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.scatter">
            <ScatterSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.bubble">
            <BubbleSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.pareto">
            <ParetoSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.bellCurve">
            <BellCurveSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.gauges">
            <GaugeSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.wordCloud">
            <WordCloudSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.treeMap">
            <TreeMapSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.stackedColumn || itemSelected === WidgetType.stackedBar">
            <StackSeriesSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.kpi">
            <NumberSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.histogram">
            <HistogramSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.spiderWeb">
            <SpiderSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.tabFilter">
            <TabFilterSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.heatMap">
            <HeatMapSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.map">
            <MapSetting />
          </template>
          <template v-else-if="itemSelected === WidgetType.parliament">
            <ParliamentSetting />
          </template>
          <template v-else>
            <div class="overflow-auto flex-grow-1">
              <template v-for="(tab, index) in settings">
                <PanelHeader :id="index" v-bind:key="index" :class="panelHeaderClassAt(index)" :header="tab.name" :target-id="tab.key">
                  <template v-for="(item, index) in tab.settingItems">
                    <div v-if="isNoneComponent(item.type)" :key="index" class="col-6 mar-b-16" />
                    <GroupSettingComponent v-else-if="isGroupSettingComponent(item.type)" :key="index" :settingItem="item" @onChanged="handleSettingChanged" />
                    <component
                      :is="item.type"
                      v-else-if="item.type"
                      :key="index"
                      :settingItem="item"
                      class="setting-item mb-2"
                      @onChanged="handleSettingChanged"
                    />
                  </template>
                </PanelHeader>
              </template>
            </div>
          </template>
        </div>
      </div>
    </template>
  </BModal>
</template>

<script lang="ts">
import { Component, PropSync, Vue, Watch } from 'vue-property-decorator';
import PreviewPanel from '@/screens/ChartBuilder/components/VizPanel/PreviewPanel.vue';
import DiFlatButton from '@/shared/components/DiFlatButton.vue';
import DiButton from '@/shared/components/DiButton.vue';
import DiTitle from '@/shared/components/DiTitle.vue';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import { TabItem } from '@/shared/models';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { ChartUtils } from '@/utils';
import { Config } from 'vuescroll';
import { ScrollConfigs, WidgetType } from '@/shared';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { DataModule } from '@/screens/DashboardDetail/stores/controller/DataStore';
import PivotSetting from '@/shared/Settings/PivotTable/PivotSetting.vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc';
import { VizSettingModule } from '@/store/modules/data_builder/viz_setting.store';
import TableSetting from '@/shared/Settings/Table/TableSetting.vue';
import SeriesSetting from '@/shared/Settings/SeriesChart/SeriesSetting.vue';
import ScatterSetting from '@/shared/Settings/ScatterSetting/ScatterSetting.vue';
import BubbleSetting from '@/shared/Settings/BubbleSetting/BubbleSetting.vue';
import ParetoSetting from '@/shared/Settings/ParetoSetting/ParetoSetting.vue';
import BellCurveSetting from '@/shared/Settings/BellCurveSetting/BellCurveSetting.vue';
import GaugeSetting from '@/shared/Settings/GaugeSetting/GaugeSetting.vue';
import WordCloudSetting from '@/shared/Settings/WordCloudSetting/WordCloudSetting.vue';
import TreeMapSetting from '@/shared/Settings/TreeMapSetting/TreeMapSetting.vue';
import StackSeriesSetting from '@/shared/Settings/StackChart/StackSeriesSetting.vue';
import PieSetting from '@/shared/Settings/Pie/PieSetting.vue';
import FunnelSetting from '@/shared/Settings/FunnelChart/FunnelSetting.vue';
import PyramidSetting from '@/shared/Settings/PyramidChart/PyramidSetting.vue';
import NumberSetting from '@/shared/Settings/NumberSetting/NumberSetting.vue';
import HistogramSetting from '@/shared/Settings/HistogramSetting/HistogramSetting.vue';
import SpiderSetting from '@/shared/Settings/SpiderSetting/SpiderSetting.vue';
import TabFilterSetting from '@/shared/Settings/TabFilterSetting/TabFilterSetting.vue';
import HeatMapSetting from '@/shared/Settings/HeatMapSetting/HeatMapSetting.vue';
import MapSetting from '@/shared/Settings/MapSetting/MapSetting.vue';
import ParliamentSetting from '@/shared/Settings/ParliamentSetting/ParliamentSetting.vue';

@Component({
  components: {
    HeatMapSetting,
    HistogramSetting,
    SpiderSetting,
    TableSetting,
    PanelHeader,
    DiButton,
    DiFlatButton,
    PreviewPanel,
    DiTitle,
    PivotSetting,
    SeriesSetting,
    ScatterSetting,
    BubbleSetting,
    ParetoSetting,
    BellCurveSetting,
    GaugeSetting,
    WordCloudSetting,
    TreeMapSetting,
    StackSeriesSetting,
    FunnelSetting,
    PyramidSetting,
    PieSetting,
    NumberSetting,
    TabFilterSetting,
    MapSetting,
    ParliamentSetting
  }
})
export default class VizSettingModal extends Vue {
  @PropSync('isShow', { type: Boolean })
  isShowSync!: boolean;
  revertSettingBloc?: SettingBloc;
  private readonly WidgetType = WidgetType;
  //todo resolve lock scroll
  private configOps: Config = ScrollConfigs;

  private get itemSelected(): WidgetType {
    return DataBuilderModule.currentWidgetType;
  }

  private get settings(): TabItem[] {
    return DataBuilderModule.currentSetting;
  }

  @Watch('isShow')
  onShowChanged(isShow: boolean) {
    if (isShow) {
      this.revertSettingBloc = QueryBuilderStoreModule.getSettingBloc().clone();
      this.resizeChart();
    }
  }

  private resizeChart() {
    this.$nextTick(() => {
      this.$root.$emit(DashboardEvents.resizeWidget, DataModule.PREVIEW_WIDGET_ID);
    });
  }

  private isNoneComponent(type: string) {
    return ChartUtils.isNoneComponent(type);
  }

  private isGroupSettingComponent(type: string) {
    return ChartUtils.isGroupSettingComponent(type);
  }

  private handleCancelSetting() {
    if (this.revertSettingBloc) {
      QueryBuilderStoreModule.setSettingBloc(this.revertSettingBloc);
      VizSettingModule.setVizSettingData(this.revertSettingBloc.getVizSettingData());
    }
    DataBuilderModule.resetSetting();
    DataBuilderModule.closeSetting();
  }

  private async handleSaveSetting() {
    await DataBuilderModule.saveSetting();
    DataBuilderModule.closeSetting();
  }

  private handleSettingChanged(key: string, value: any) {
    return DataBuilderModule.updateSettingItem({ settingKey: key, value: value });
  }

  //Work around get last item
  private panelHeaderClassAt(index: number): string {
    const isLastItem: boolean = index == this.settings.length - 1;
    return isLastItem ? 'pb-4' : '';
  }
}
</script>

<style lang="scss" scoped>
::v-deep {
  .modal-dialog {
    border-radius: 4px;
    height: 80vh !important;
    max-width: unset !important;
    padding: 0;
    width: 80% !important;
  }

  .modal-body {
    height: 80vh !important;
    padding: 0;
    width: 100%;
  }

  .visualization {
    flex-grow: 1;
    overflow: hidden;
    //padding: 0;
  }

  .setting {
    flex-shrink: 1;
    max-width: 352px;
    min-width: 352px;
    width: 35%;
  }
}

.setting-header {
  align-items: end;
  display: flex;
  flex-direction: row;
  @media (max-width: 1100px) {
    flex-direction: column;
    justify-content: start;
    .setting-actions {
      margin-top: 8px;
    }
  }
}

.save-btn {
  background: var(--accent);

  ::v-deep {
    .title {
      opacity: 1;
    }
  }
}
</style>
