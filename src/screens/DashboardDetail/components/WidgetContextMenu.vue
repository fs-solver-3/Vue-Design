<template>
  <div>
    <VueContext ref="contextMenu" class="widget-context-menu" tag="div">
      <DataListing :records="contextMenuOptions" keyForDisplay="text" keyForValue="click" @onClick="handleChooseOption" />
    </VueContext>
    <ZoomSettingContextMenu ref="zoomMenu"></ZoomSettingContextMenu>
    <DrilldownSettingContextMenu ref="drilldownMenu"></DrilldownSettingContextMenu>
    <DashboardListingContextMenu ref="dashboardMenu"></DashboardListingContextMenu>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator';
import { ChartInfo, DashboardId, Drilldownable, QuerySettingType } from '@core/domain';
import { MouseEventData } from '@chart/BaseChart';
import DataListing from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/DataListing.vue';
import { ContextMenuItem, Routers } from '@/shared';
import VueContext from 'vue-context';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { cloneDeep, isFunction } from 'lodash';
import DrilldownSettingContextMenu from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/Drilldown/DrilldownSettingContextMenu.vue';
import ZoomSettingContextMenu from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/Zoom/ZoomSettingContextMenu.vue';
import DashboardListingContextMenu from '@/screens/DashboardDetail/components/DrillThrough/DashboardListingContextMenu.vue';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';
import { DashboardControllerModule, DashboardModule, DrilldownDataStoreModule, QuerySettingModule } from '@/screens/DashboardDetail/stores';
import { ZoomModule } from '@/store/modules/zoom.store';
import { DrillThroughResolver } from '@/screens/DashboardDetail/components/DrillThrough/DrillThroguhHandler/DrillThroughResolver';
import { Log } from '@core/utils';
import { ListUtils } from '@/utils';

@Component({
  components: {
    ZoomSettingContextMenu,
    DrilldownSettingContextMenu,
    DataListing,
    VueContext,
    DashboardListingContextMenu
  }
})
export default class WidgetContextMenu extends Vue {
  private contextMenuOptions: ContextMenuItem[] = [];
  @Ref()
  private readonly contextMenu?: VueContext;

  @Ref()
  private readonly zoomMenu?: ZoomSettingContextMenu;

  @Ref()
  private readonly drilldownMenu?: DrilldownSettingContextMenu;

  @Ref()
  private readonly dashboardMenu?: DashboardListingContextMenu;

  private readonly drillThroughResolver = new DrillThroughResolver();

  show(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    // Log.debug('setting', metaData.setting)
    this.contextMenuOptions = this.getMenuOptions(metaData, mouseEventData);
    this.contextMenu?.open(mouseEventData.event, {});
  }

  mounted() {
    this.$root.$on(DashboardEvents.HideDrillDown, this.hideDrilldown);
  }

  beforeDestroy() {
    this.$root.$off(DashboardEvents.HideDrillDown, this.hideDrilldown);
  }

  private dashboardId(): string {
    return DashboardModule.id!.toString();
  }

  private handleChooseOption(clickFn: Function): void {
    this.contextMenu?.close();
    if (isFunction(clickFn)) {
      clickFn();
    }
  }

  private getMenuOptions(metaData: ChartInfo, mouseEventData: MouseEventData<string>): ContextMenuItem[] {
    const options: ContextMenuItem[] = [
      {
        text: 'Zoom',
        click: () => this.handleClickZoom(metaData, mouseEventData),
        disabled: this.isDisableZoom(metaData, mouseEventData)
      },
      {
        text: 'Drill down',
        click: () => this.handleClickDrilldown(metaData, mouseEventData),
        disabled: this.isDisableDrilldown(metaData, mouseEventData)
      },
      {
        text: 'Drill through',
        click: () => this.handleClickDrillThrough(metaData, mouseEventData),
        disabled: this.isDisableDrillThrough(metaData, mouseEventData)
      },
      // {
      //   text: 'Reset zoom',
      //   click: () => this.resetZoom(metaData, mouseEventData),
      //   disabled: this.isDisableResetZoom(metaData, mouseEventData)
      // },
      {
        text: 'Reset drill down',
        click: () => this.resetDrilldown(metaData, mouseEventData),
        disabled: this.isDisableResetDrilldown(metaData, mouseEventData)
      }
    ];

    return this.removeDisabledOptions(options);
  }

  private handleClickZoom(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    this.zoomMenu?.show(metaData, mouseEventData);
  }

  private handleClickDrilldown(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    this.drilldownMenu?.show(metaData, mouseEventData);
  }

  private handleClickDrillThrough(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    this.dashboardMenu?.show(mouseEventData.event, dashboardId => this.drillThrough(dashboardId, metaData, mouseEventData));
  }

  private hideDrilldown() {
    this.drilldownMenu?.hide();
  }

  private drillThrough(dashboardDrillThrough: DashboardId, metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    const finalMetaData = this.getFinalMetaData(metaData);
    const mainFilters = this.getAllMainFilters(finalMetaData, mouseEventData);
    const filtersAsString = JSON.stringify(mainFilters);
    this.openDashboardTab(dashboardDrillThrough, filtersAsString);
  }

  private getAllMainFilters(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    const dataManager = DI.get(DataManager);
    const mainFilters = dataManager.getMainFilters(this.dashboardId());
    const extraFilters = this.drillThroughResolver.createFilter(metaData, mouseEventData);
    return [...mainFilters, ...extraFilters];
  }

  private openDashboardTab(dashboardDrillThrough: DashboardId, filtersAsString: string) {
    const query = {
      ...this.$route.query,
      filters: filtersAsString
    };
    const route = this.$router.resolve({
      name: Routers.dashboardDetail,
      params: {
        dashboardId: dashboardDrillThrough.toString()
      },
      query: query
    });
    window.open(route.href, '_blank');
  }

  private isDisableZoom(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    const options = metaData.setting.getVisualizationSetting()?.options ?? {};
    const isEnableZoom = options.isEnableZoom ?? false;
    return !(isEnableZoom && ZoomModule.canZoom(metaData.id));
  }

  private isDisableDrilldown(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    const options = metaData.setting.getVisualizationSetting()?.options ?? {};
    const isEnableDrilldown = options.isEnableDrilldown ?? false;
    return !(isEnableDrilldown && Drilldownable.isDrilldownable(metaData.setting));
  }

  private isDisableDrillThrough(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    switch (metaData.setting.className) {
      case QuerySettingType.TabFilter:
        return true;
      default:
        return false;
    }
  }

  // private resetZoom(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
  //   const queryHistories = DrilldownDataStoreModule.getQuerySettings(metaData.id);
  //   const query = ListUtils.getLast(queryHistories) ?? metaData.setting;
  //   ZoomModule.registerZoomDataById({ id: metaData.id, query: query });
  //   DashboardControllerModule.renderChartOrFilter({ widget: metaData });
  // }
  //
  // private isDisableResetZoom(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
  //
  // }

  private resetDrilldown(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    const { id, setting } = metaData;
    DrilldownDataStoreModule.resetDrilldown(metaData.id);
    ZoomModule.registerZoomDataById({ id: id, query: setting });
    QuerySettingModule.setQuerySetting({ id: id, query: setting });
    DashboardControllerModule.renderChartOrFilter({ widget: metaData });
  }

  private isDisableResetDrilldown(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    return !DrilldownDataStoreModule.hasDrilldown(metaData.id);
  }

  private removeDisabledOptions(options: ContextMenuItem[]) {
    return options.filter(option => !option.disabled);
  }

  private getFinalMetaData(metaData: ChartInfo) {
    const finalMetaData = cloneDeep(metaData);
    const historySettings = DrilldownDataStoreModule.getQuerySettings(metaData.id);
    finalMetaData.setting = ListUtils.getLast(historySettings) ?? finalMetaData.setting;
    return finalMetaData;
  }
}
</script>

<style lang="scss">
div.v-context.widget-context-menu {
  background: var(--primary);

  border: none;
  box-shadow: none;
  min-width: 160px;
  padding: 4px 0;

  h4 {
    font-size: 14px;
    font-stretch: normal;
    font-style: normal;
    font-weight: normal;
    line-height: normal;
    opacity: 0.8;
  }
}
</style>
