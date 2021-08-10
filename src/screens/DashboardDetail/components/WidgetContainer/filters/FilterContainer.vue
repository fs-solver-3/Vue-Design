<template>
  <div v-b-hover="handleHover" class="d-flex flex-row align-items-center">
    <StatusWidget :renderWhen="renderWhen" :status="status" @retry="retryLoadData">
      <FilterWidget
        v-if="filterData"
        :id="filter.id"
        :backgroundColor="filter.backgroundColor"
        :data="filterData"
        :filterType="filter.className"
        :setting="filter.setting"
        :showEditComponent="showEditComponent"
        :subTitle="filter.description"
        :textColor="filter.textColor"
        :title="filter.name"
        @hook:mounted="handleOnRendered"
      >
      </FilterWidget>
    </StatusWidget>
    <template v-if="showEditComponent">
      <b-icon-three-dots-vertical v-show="isShowEdit" class="ml-auto btn-icon btn-ghost-alter di-popup ic-16 mr-1" @click.prevent="clickSeeMore">
      </b-icon-three-dots-vertical>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Provide, Vue } from 'vue-property-decorator';
import { BuilderMode, ContextMenuItem, DashboardOptions, Routers, Status } from '@/shared';
import {
  DashboardModalModule,
  DashboardModeModule,
  DashboardModule,
  FilterModule,
  RenderControllerModule,
  WidgetModule
} from '@/screens/DashboardDetail/stores';
import FilterWidget from '@filter/FilterWidget.vue';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import ChartContainer from '../charts/ChartContainer.vue';
import { DIException, QueryRelatedWidget } from '@core/domain';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';
import { RouteUtils } from '@/utils/routes.utils';
import { Log } from '@core/utils';

@Component({
  components: {
    FilterWidget,
    StatusWidget
  }
})
export default class FilterContainer extends Vue {
  readonly renderWhen = ChartContainer.RENDER_WHEN;
  isHovered = false;
  @Prop({ required: true })
  filter!: QueryRelatedWidget;
  @Prop({ type: Boolean, default: false })
  showEditComponent!: boolean;
  // Provide from DiGridstackItem
  @Inject()
  remove!: (fn: Function) => void;

  get isShowEdit() {
    return this.showEditComponent && this.isHovered;
  }

  get filterClass(): string {
    return this.showEditComponent ? 'disable' : '';
  }

  get filterData(): any {
    throw new DIException('No implement');
    // return DataModule.chartDataResponses[this.filter.id];
  }

  get status(): Status {
    return Status.Error;
    // return DataModule.statuses[this.filter.id];
  }

  private get menuItems(): ContextMenuItem[] {
    return [
      {
        text: DashboardOptions.CONFIG_FILTER,
        click: this.configData,
        disabled: !DashboardModeModule.canEdit
      },
      {
        text: DashboardOptions.DUPLICATE,
        click: this.duplicateWidget,
        disabled: !DashboardModeModule.canDuplicate
      },
      {
        text: DashboardOptions.DELETE,
        click: this.deleteFilter,
        disabled: !DashboardModeModule.canDelete
      }
    ];
  }

  //Provide value into filter
  @Provide()
  private get defaultValue(): any {
    return '';
  }

  private handleHover(isHovered: boolean) {
    this.isHovered = isHovered;
  }

  private clickSeeMore(event: Event) {
    DashboardModalModule.showContextMenu({
      event: event,
      items: this.menuItems
    });
  }

  private configData() {
    DashboardModalModule.hideContextMenu();
    const dashboardId = DashboardModule.id;
    if (dashboardId) {
      const dataManager = DI.get(DataManager);
      dataManager.saveDashboardId(dashboardId.toString());
      dataManager.saveWidget(this.filter);
      dataManager.saveChartBuilderMode(BuilderMode.edit);
      RouteUtils.navigateToDataBuilder(this.$route, FilterModule.routerFilters);
    }
  }

  private duplicateWidget() {
    DashboardModalModule.hideContextMenu();
    WidgetModule.handleDuplicateWidget(this.filter);
  }

  private deleteFilter() {
    this.remove(() => {
      DashboardModalModule.hideContextMenu();
      WidgetModule.handleDeleteWidget(this.filter);
    });
  }

  private handleOnRendered() {
    Log.debug('ChartContainer::handleOnRendered', this.filter.id);
    this.$nextTick(() => {
      RenderControllerModule.completeRender(this.filter.id);
    });
  }

  private retryLoadData() {
    // DataControllerModule.renderChartOrFilter({ widget: this.filter, force: true });
  }

  // Provide function into filter
  @Provide()
  private onFilterValueChanged(value: any) {
    //
  }
}
</script>

<style lang="scss" scoped>
.pad-l-15 {
  padding-left: 15px;
}
</style>
