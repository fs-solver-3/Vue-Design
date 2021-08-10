<template>
  <div>
    <div>
      <template>
        <template v-if="isEditMode">
          <div :id="drilldownId" ref="btnDrilldownRef" tabindex="-1">
            <div :id="id" ref="btnMenuRef" class="btn-ghost-alter" tabindex="-1" @click="toggleMenu">
              <img alt="More" class="icon-title di-popup ic-40 cursor-pointer" src="@/assets/icon/ic-more.svg" />
            </div>
          </div>
          <b-popover :custom-class="getPopoverClass()" :show.sync="isShowMenu" :target="id" placement="BottomLeft" triggers="blur">
            <div class="regular-icon-16 text-left">
              <template v-for="(item, index) in menuOptions">
                <DiButton
                  :id="genBtnId(`action-${item.text}`, index)"
                  :key="genBtnId(`action-${item.text}`, index)"
                  :is-disable="item.disabled"
                  :title="item.text"
                  text-style="regular-text-14-white"
                  @click="item.click"
                >
                  <img v-if="hasIcon(item.icon)" :src="require(`@/assets/icon/${item.icon}`)" alt="" />
                </DiButton>
              </template>
            </div>
          </b-popover>
        </template>
        <template v-else>
          <div class="d-flex flex-row">
            <div
              v-if="canZoom()"
              :id="zoomId"
              ref="btnZoomRef"
              v-b-tooltip.d500.top="'Zoom'"
              class="d-table btn-icon-40 btn-ghost-alter"
              tabindex="-1"
              title="Zoom"
              @click="toggleZoom"
            >
              <div class="d-table-cell align-middle text-center">
                <img alt="zoom" class="unselectable" src="@/assets/icon/ic-zoom.svg" />
              </div>
            </div>
            <div
              v-if="canDrilldown()"
              :id="drilldownId"
              ref="btnDrilldownRef"
              v-b-tooltip.d500.top="'Drilldown'"
              class="d-table btn-icon-40 btn-ghost-alter bg-none"
              tabindex="-1"
              @click.stop="toggleDrilldown"
            >
              <div class="d-table-cell align-middle text-center">
                <img alt="drilldown" class="unselectable" src="@/assets/icon/ic-drilldown.svg" />
              </div>
            </div>
          </div>
        </template>
      </template>

      <ZoomSettingPopover v-if="isShowZoom" :meta-data="metaData" :targetId="zoomId" @hide="hideZoomPopover" />
    </div>
    <template v-if="isShowDrilldown">
      <DrilldownSettingPopover :metaData="metaData" :targetId="drilldownId" @hide="hideDrilldown" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import DiButton from '@/shared/components/DiButton.vue';
import { DashboardModeModule } from '@/screens/DashboardDetail/stores/dashboard/DashboardModeStore';
import { ContextMenuItem, DashboardMode, DashboardOptions } from '@/shared';
import { ChartInfo, WidgetId } from '@core/domain/Model';
import { ZoomModule } from '@/store/modules/zoom.store';
import DrilldownSettingPopover from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/Drilldown/DrilldownSettingPopover.vue';
import { Drilldownable } from '@core/domain/Model/Query/Features/Drilldownable';
import ZoomSettingPopover from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/Zoom/ZoomSettingPopover.vue';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import DrilldownSetting from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/Drilldown/DrilldownSetting.vue';
import VueContext from 'vue-context';
import { MouseEventData } from '@chart/BaseChart';
import { Log } from '@core/utils';

export enum MoreActionStatus {
  Zoom = 'zoom',
  Drilldown = 'drilldown',
  None = 'none'
}

@Component({
  components: { DrilldownSetting, DrilldownSettingPopover, DiButton, ZoomSettingPopover, VueContext }
})
export default class ActionWidgetMore extends Vue {
  private moreStatus: MoreActionStatus = MoreActionStatus.None;
  private isShowMenu = false;
  private isShowZoom = false;
  private isShowDrilldown = false;

  @Ref()
  private readonly btnMenuRef?: HTMLElement;
  @Ref()
  private readonly btnZoomRef?: HTMLElement;
  @Ref()
  private readonly btnDrilldownRef?: HTMLElement;
  @Ref()
  private readonly drilldownSetting!: DrilldownSetting;
  @Prop({ required: true, type: String })
  private id!: string;
  @Prop({ required: true, type: String })
  private drilldownId!: string;
  @Prop({ required: true, type: String })
  private zoomId!: string;
  @Prop({ required: true, type: Object })
  private metaData!: ChartInfo;
  @Prop({ required: true })
  private readonly dashboardMode!: DashboardMode;
  // Inject from ChartContainer.vue
  @Inject({ default: undefined })
  private handleEditChart?: () => void;
  // Inject from ChartContainer.vue
  @Inject({ default: undefined })
  private handleEditTitle?: () => void;
  // Inject from ChartContainer.vue
  @Inject({ default: undefined })
  private duplicateChart?: () => void;
  // Inject from ChartContainer.vue
  @Inject({ default: undefined })
  private deleteChart?: () => void;

  private get isEditMode(): boolean {
    return this.dashboardMode == DashboardMode.Edit;
  }

  private get menuOptions(): ContextMenuItem[] {
    return [
      {
        text: DashboardOptions.EDIT_TITLE,
        click: this.handleEditTitle,
        disabled: !DashboardModeModule.canEdit
      },
      {
        text: DashboardOptions.CONFIG_CHART,
        click: this.handleEditChart,
        disabled: !DashboardModeModule.canEdit
      },
      {
        text: DashboardOptions.DUPLICATE_CHART,
        click: this.duplicateChart,
        disabled: !DashboardModeModule.canDuplicate
      },
      {
        text: DashboardOptions.DELETE,
        click: this.deleteChart,
        disabled: !DashboardModeModule.canDelete
      }
    ];
  }

  @Watch('isEditMode')
  handleEditModeChange(isEditMode: boolean) {
    if (isEditMode) {
      this.hideDrilldown();
      this.hideZoomPopover();
    }
  }

  handleClickDataPoint(id: WidgetId, mouseEventData: MouseEventData<string>): void {
    const canHandle = this.metaData.id == id && !this.isEditMode;
    if (canHandle) {
      this.hideDrilldown();
      this.$root.$emit(DashboardEvents.ShowWidgetContextMenu, this.metaData, mouseEventData);
    } else {
      this.handleHidePopover(mouseEventData.event);
    }
  }

  mounted() {
    Log.debug('ActionWidgetMore::mounted', this.metaData.id);
    this.registerEvents();
  }

  beforeDestroy() {
    Log.debug('ActionWidgetMore::beforeDestroy', this.metaData.id);
    this.unregisterEvents();
  }

  private toggleMenu() {
    this.hideZoomPopover();
    this.hideDrilldown();
    this.btnMenuRef?.focus();
    this.isShowMenu = !this.isShowMenu;
  }

  private getPopoverClass(): string {
    switch (this.moreStatus) {
      case MoreActionStatus.Zoom:
        return 'none-action-container';
      case MoreActionStatus.Drilldown:
        return 'db-listing-searchable';
      default:
        return 'none-action-container';
    }
  }

  private hasIcon(icon?: string): boolean {
    return !!icon;
  }

  private toggleDrilldown(): void {
    this.hideMenuPopover();
    this.hideZoomPopover();
    this.$root.$emit(DashboardEvents.HideDrillDown);

    this.btnDrilldownRef?.focus();
    this.isShowDrilldown = !this.isShowDrilldown;

    if (this.isShowDrilldown) {
      this.moreStatus = MoreActionStatus.Drilldown;
      this.$nextTick(() => {
        this.clickOutsideListener();
      });
    }
  }

  private clickOutsideListener() {
    const app: HTMLElement | null = document.getElementById('app');
    if (app) {
      app.addEventListener('click', this.handleHidePopover);
    }
  }

  private toggleZoom() {
    this.hideMenuPopover();
    this.hideDrilldown();

    this.btnZoomRef?.focus();
    this.isShowZoom = !this.isShowZoom;
    if (this.isShowZoom) {
      this.moreStatus = MoreActionStatus.Zoom;
    }
  }

  private canZoom(): boolean {
    const querySetting: QuerySetting = this.metaData.setting;
    const options = querySetting.getVisualizationSetting()?.options ?? {};
    const isEnableZoom: boolean = options.isEnableZoom ?? false;
    const enableIconZoom = options.enableIconZoom ?? false;
    return enableIconZoom && isEnableZoom && ZoomModule.canZoom(this.metaData.id);
  }

  private canDrilldown(): boolean {
    const querySetting: QuerySetting = this.metaData.setting;
    const options = querySetting.getVisualizationSetting()?.options ?? {};
    const enableDrilldown: boolean = options.isEnableDrilldown ?? false;
    const enableIconDrilldown = options.enableIconDrilldown ?? false;
    return enableIconDrilldown && enableDrilldown && Drilldownable.isDrilldownable(querySetting);
  }

  private hideMenuPopover() {
    this.isShowMenu = false;
    this.moreStatus = MoreActionStatus.None;
  }

  private hideDrilldown() {
    this.moreStatus = MoreActionStatus.None;
    this.isShowDrilldown = false;
  }

  private hideZoomPopover() {
    this.isShowZoom = false;
    this.unregisterFunctionHidePopover();
    this.moreStatus = MoreActionStatus.None;
  }

  private unregisterFunctionHidePopover() {
    const app: HTMLElement | null = document.getElementById('app');
    if (app) {
      app.removeEventListener('click', this.handleHidePopover);
    }
  }

  private handleHidePopover(event: MouseEvent) {
    const isClickOutsizeButtonZoom = !(this.btnZoomRef?.contains(event.target as Element) ?? false);
    if (isClickOutsizeButtonZoom) {
      this.hideZoomPopover();
    }
    this.hideDrilldown();
    this.hideMenuPopover();
  }

  private registerEvents() {
    this.$root.$on(DashboardEvents.ClickDataPoint, this.handleClickDataPoint);
  }

  private unregisterEvents() {
    this.$root.$off(DashboardEvents.ClickDataPoint, this.handleClickDataPoint);
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.title-filter-menu {
  @include semi-bold-14();
}

.footer-filter-menu {
  @include regular-text-14();
}

.divider {
  background-color: rgba(255, 255, 255, 0.1);
  height: 1px;
  margin: 16px 0 16px 0;
}

.db-listing-searchable {
  background-color: var(--primary);
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  box-sizing: content-box;
  max-width: unset;
  padding: 16px;
  width: 256px;
  z-index: 10001;
}

.none-action-container {
  background-color: var(--primary);
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  box-sizing: content-box;
  max-width: unset;
  padding: 4px 0 4px 0;
  text-align: left;
  width: 145px;

  ::v-deep {
    .arrow {
      display: none;
    }

    .popover-body {
      padding: 0 !important;
    }
  }
}

.btn-icon-40 {
  height: 40px;
  width: 40px;
}

.btn-ghost-alter {
  background: none !important;
  opacity: var(--normal-opacity);

  &:active,
  &:hover,
  &:visited {
    background: none !important;
    opacity: var(--active-opacity);
  }
}

.bg-none {
  background: none !important;

  &:active {
    background: none !important;
  }
}
</style>
