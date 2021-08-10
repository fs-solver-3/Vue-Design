<template>
  <div class="d-inline-block visualization-area">
    <div class="d-flex flex-row header align-items-center justify-content-between">
      <div class="title unselectable">Visualization</div>
      <DiDropdown
        :id="genDropdownId('visualization-actions')"
        v-model="selectedVisualizationAction"
        :data="options"
        class="ml-auto action-selection"
        hidden
        label-props="displayName"
        value-props="id"
      >
      </DiDropdown>
      <div class="d-flex flex-row">
        <!--        <DiFlatButton :id="genBtnId('custom-render')" title="Custom Render" :is-disable="!hasWidget">-->
        <!--          <img src="@/assets/icon/ic-code.svg" alt="Custom render" />-->
        <!--        </DiFlatButton>-->
        <DiFlatButton :id="genBtnId('setting')" :is-disable="!hasWidget" class="ml-1" title="Settings" @click="handleOpenSetting">
          <img alt="Settings" src="@/assets/icon/ic-settings-wrench.svg" />
        </DiFlatButton>
      </div>
    </div>
    <div class="d-flex flex-column body">
      <PreviewPanel v-if="showPreviewWidget" class="visualization"></PreviewPanel>
      <!--      <SettingPanel-->
      <!--        :css.sync="css"-->
      <!--        :html.sync="html"-->
      <!--        :isDisable="isDisableSetting"-->
      <!--        :js.sync="js"-->
      <!--        :tabItems.sync="tabItems"-->
      <!--        class="setting"-->
      <!--        @applyCustomDisplay="handleApplyCustomDisplay"-->
      <!--      ></SettingPanel>-->
      <!--      <DiButton :id="genBtnId('apply-setting-panel')" class="apply-button" v-if="isMap()" title="Apply" @click="handleApply"></DiButton>-->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { SelectOption, VisualizationItemData, VizActionType, WidgetType } from '@/shared';
import PreviewPanel from '@/screens/ChartBuilder/components/VizPanel/PreviewPanel.vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { Inject } from 'typescript-ioc';
import SettingPanel from '@/screens/ChartBuilder/components/VizPanel/SettingPanel/SettingPanel.vue';
import { ChartSettingUtils, ChartUtils } from '@/utils';
import { JsonUtils, Log } from '@core/utils';
import { cloneDeep } from 'lodash';
import { CustomChartData, VizSetting, VizSettingData } from '@core/domain/Model';
import { TabItem } from '@/shared/models';
import { DefaultHtml } from '@/shared/constants/custom-chart.html';
import { DefaultCss } from '@/shared/constants/custom-chart.css';
import { DefaultJs } from '@/shared/constants/custom-chart.js';
import { GeolocationModule } from '@/store/modules/data_builder/geolocation.store';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import DiFlatButton from '@/shared/components/DiFlatButton.vue';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import { VizSettingModule } from '@/store/modules/data_builder/viz_setting.store';
import { VizSettingResolver } from '@/shared/Resolver';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ALL_SETTINGS = require('@/shared/constants/chart_setting_data.json');

enum ProcessTypes {
  table = 'table',
  histogram = 'histogram',
  map = 'map'
}

@Component({
  components: {
    DiFlatButton,
    PreviewPanel,
    SettingPanel
  }
})
export default class VizPanel extends Vue {
  private options: SelectOption[] = [
    {
      displayName: 'Auto Refresh',
      id: VizActionType.auto
    },
    {
      displayName: 'Manual',
      id: VizActionType.manual
    }
  ];

  private tabItems: TabItem[] = [];
  private html = '';
  private js = '';
  private css = '';

  @Inject
  private readonly settingResolver!: VizSettingResolver;

  public get widgetType(): WidgetType {
    return DataBuilderModule.currentWidgetType;
  }

  public get chartType(): WidgetType {
    return this.itemSelected.type as WidgetType;
  }

  private get allSettings(): any {
    // @ts-ignore
    return JsonUtils.fromObject(ALL_SETTINGS);
  }

  private get itemSelected(): VisualizationItemData {
    return QueryBuilderStoreModule.itemSelected;
  }

  private get selectedVisualizationAction(): VizActionType {
    return QueryBuilderStoreModule.visualizationAction;
  }

  private get hasWidget(): boolean {
    return !!VisualizationStoreModule.finalWidget;
  }

  private get showPreviewWidget() {
    return !DataBuilderModule.isShowingSetting;
  }

  public getTabItems(): TabItem[] {
    return this.tabItems;
  }

  @Watch('tabItems', { immediate: true, deep: true })
  /**
   * @deprecated from v1.0.4
   */
  async onTabConfigChanged(tabItems: TabItem[], oldTabItems: TabItem[]) {
    // // FIXME: remove current function when done, add type to bloc builder change setting
    switch (this.itemSelected.type as WidgetType) {
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
      case WidgetType.histogram:
      case WidgetType.spiderWeb:
      case WidgetType.kpi:
      case WidgetType.tabFilter:
      case WidgetType.map:
      case WidgetType.heatMap:
      case WidgetType.parliament: {
        return;
      }
    }
    const vizSetting: VizSetting | undefined = this.getVizSetting();
    VisualizationStoreModule.saveVizSetting(vizSetting);
    const processType: ProcessTypes | null = this.getCurrentProcessType(this.widgetType, tabItems, oldTabItems);

    switch (processType) {
      // case ProcessTypes.table: {
      //   await QueryBuilderStoreModule.setDisplayTableType(ChartUtils.getDisplayTableType(tabItems)!);
      //   await DataBuilderModule.buildQueryAndRenderVizPanel();
      //   break;
      // }
      case ProcessTypes.histogram: {
        await QueryBuilderStoreModule.setBinsNumber(ChartUtils.getBinsNumber(tabItems)!);
        await DataBuilderModule.buildQueryAndRenderVizPanel();
        break;
      }
      // case ProcessTypes.map: {
      //   const area = ChartUtils.getArea(tabItems) ?? '';
      //   GeolocationModule.saveCurrentArea(area);
      //   await GeolocationModule.loadListGeolocationWithCode({ code: area });
      //   Log.debug('onTabConfigChanged:: onTabConfigChanged', GeolocationModule.normalizedNameMap);
      //   await QueryBuilderStoreModule.buildQueryAndRenderVizPanel();
      //   break;
      // }
    }
  }

  setTabItems(tabItems: TabItem[]): void {
    this.tabItems = cloneDeep(tabItems ?? []);
  }

  setCustomChartData(customChartData: CustomChartData) {
    this.html = customChartData.html ?? DefaultHtml;
    this.js = customChartData.js ?? DefaultJs;
    this.css = customChartData.css ?? DefaultCss;
  }

  private getCurrentProcessType(chartType: WidgetType, tabItems: TabItem[], oldTabItems: TabItem[]): ProcessTypes | null {
    if (chartType == WidgetType.table && this.isNeedChangeValue(ChartUtils.getDisplayTableType(tabItems), QueryBuilderStoreModule.displayTableType)) {
      return ProcessTypes.table;
    }
    if (chartType == WidgetType.histogram && this.isNeedChangeValue(ChartUtils.getBinsNumber(tabItems), QueryBuilderStoreModule.binsNumber)) {
      return ProcessTypes.histogram;
    }
    if (this.widgetType == WidgetType.map && ChartUtils.isAreaDifferent(this.tabItems, GeolocationModule.areaSelected ?? '')) {
      return ProcessTypes.map;
    }
    return null;
  }

  private getVizSetting(): VizSetting | undefined {
    const options: VizSettingData = ChartSettingUtils.getDiSettingOptions(this.tabItems);
    options.js = QueryBuilderStoreModule.js;
    options.html = QueryBuilderStoreModule.html;
    options.css = QueryBuilderStoreModule.css;
    return this.settingResolver.toVizSetting(this.widgetType, options);
  }

  private isNeedChangeValue(newValue: string | undefined, oldValue: string): boolean {
    return !!(newValue && newValue !== oldValue);
  }

  private getTabSetting(type: string): any | undefined {
    return this.allSettings.vizSettings.find((setting: any) => setting.key === type);
  }

  @Watch('itemSelected', { immediate: true })
  private onItemSelectedChanged(selectedItem: VisualizationItemData): void {
    const tabSetting = this.getTabSetting(selectedItem.type);
    if (tabSetting) {
      const newTabItems = ChartUtils.getTabItems(tabSetting, this.widgetType);
      Log.debug('Watch:: newTabItems', newTabItems);
      this.tabItems = ChartUtils.keepSettings(newTabItems, VizSettingModule.currentSetting);
      Log.debug('Watch', this.tabItems);
    } else {
      const newTabItems = this.getDefaultConfigs();
      this.tabItems = ChartUtils.keepSettings(newTabItems, this.tabItems);
    }
    this.loadCustomCode(this.widgetType);
  }

  private loadCustomCode(widgetType: WidgetType): void {
    this.js = QueryBuilderStoreModule.js;
    this.html = QueryBuilderStoreModule.html;
    this.css = QueryBuilderStoreModule.css;
  }

  private getDefaultConfigs(): TabItem[] {
    return ChartUtils.getTabItems(this.allSettings.vizSettings[0], this.widgetType);
  }

  private handleApplyCustomDisplay(event: MouseEvent) {
    QueryBuilderStoreModule.setCustomCode({ js: this.js, html: this.html, css: this.css });
    const vizSetting: VizSetting | undefined = this.getVizSetting();
    VisualizationStoreModule.setFinalVizSetting(vizSetting);
  }

  private handleOpenSetting() {
    return DataBuilderModule.showSetting();
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.visualization-area {
  padding: 16px;

  .header {
    @include regular-text();
    color: var(--white);
    height: 42px;

    .title {
      font-size: 24px;
      letter-spacing: 0.2px;
      line-height: 1.17;
    }

    .action-selection {
      margin-top: 0;
      min-width: 150px;

      ::v-deep {
        > .relative {
          button {
            background-color: transparent;
          }
        }
      }
    }
  }

  .body {
    height: calc(100% - 64px);
    //background: linear-gradient(131deg, var(--min-background-color, #3b425c) 2%, var(--max-background-color, #212638) 90%);

    .visualization {
      height: calc(100% - 0px);
    }

    .setting {
      height: calc(40% + 16px);
    }

    .visualization + .setting {
      margin-top: 16px;
    }
  }

  .header + .body {
    margin-top: 24px;
  }

  .apply-button {
    ::v-deep {
      width: 100%;
    }
  }
}
</style>
