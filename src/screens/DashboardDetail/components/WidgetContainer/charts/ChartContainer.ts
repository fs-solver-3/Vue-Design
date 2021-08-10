/*
 * @author: tvc12 - Thien Vi
 * @created: 12/10/20, 4:23 PM
 */

import { Component, Inject, Prop, Provide, Vue, Watch } from 'vue-property-decorator';

import { BuilderMode, ContextMenuItem, DashboardMode, DashboardOptions, SelectOption, Status } from '@/shared';
import {
  AbstractTableQuerySetting,
  ChartInfo,
  DropdownQuerySetting,
  Equal,
  In,
  PivotTableQuerySetting,
  QueryRelatedWidget,
  QuerySettingType,
  TableColumn,
  VizSetting,
  Widget,
  WidgetId,
  Widgets
} from '@core/domain/Model';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { Routers } from '@/shared/enums/routers.enum';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';
import { FilterRequest } from '@core/domain/Request';
import ChartWidget from '@/screens/DashboardDetail/components/WidgetContainer/charts/ChartWidget/ChartWidget.vue';
import { VisualizationResponse } from '@core/domain/Response';
import { ZoomModule } from '@/store/modules/zoom.store';
import EmptyWidget from '@/screens/DashboardDetail/components/WidgetContainer/charts/ErrorDisplay/EmptyWidget.vue';
import { FilterUtils, ListUtils } from '@/utils';
import { FilterModule } from '@/screens/DashboardDetail/stores/widget/FilterStore';
import ActionWidgetFilter from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/ActionWidgetFilter.vue';
import ActionWidgetMore from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/ActionWidgetMore.vue';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { RouteUtils } from '@/utils/routes.utils';
import { cloneDeep } from 'lodash';
import { QuerySettingModule } from '@/screens/DashboardDetail/stores/widget/QuerySettingStore';
import { PopupUtils } from '@/utils/popup.utils';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { ConditionUtils, Log } from '@core/utils';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import {
  DashboardControllerModule,
  DashboardModalModule,
  DashboardModeModule,
  DashboardModule,
  DataModule,
  RenderControllerModule,
  WidgetModule
} from '@/screens/DashboardDetail/stores';
import CaptureException from '@/shared/components/CaptureException';
import { DIException } from '@core/domain';
import ErrorWidget from '@/shared/components/ErrorWidget.vue';

@Component({
  components: {
    StatusWidget,
    ChartWidget,
    EmptyWidget,
    ActionWidgetFilter,
    ActionWidgetMore,
    CaptureException,
    ChartError: ErrorWidget
  }
})
export default class ChartContainer extends Vue implements FilterListener, CrossFilterListener {
  static readonly RENDER_WHEN = [Status.Rendering, Status.Rendered, Status.Error, Status.Updating];
  readonly renderWhen = ChartContainer.RENDER_WHEN;
  isHovered: boolean;
  @Prop({ required: false, type: Boolean, default: false })
  private readonly showEditComponent!: boolean;
  @Prop({ required: true })
  private readonly metaData!: ChartInfo;
  // Provide from DiGridstackItem
  @Inject({ default: undefined })
  private readonly remove?: (fn: Function) => void;

  @Prop({ required: false, type: Boolean, default: false })
  private readonly isFullSizeMode!: boolean;

  // TODO: force hide full size in builder
  @Prop({ required: false, type: Boolean, default: false })
  private readonly isEnableFullSize!: boolean;

  @Prop({ required: false, type: Boolean, default: false })
  private isPreview!: boolean;

  constructor() {
    super();
    this.isHovered = false;
  }

  get response(): VisualizationResponse {
    return DataModule.chartDataResponses[this.metaData.id];
  }

  get errorMessage(): string {
    return DataModule.mapErrorMessage[this.metaData.id];
  }

  get hasData(): boolean {
    return this.response?.hasData() ?? false;
  }

  get status(): Status {
    return DataModule.statuses[this.metaData.id];
  }

  get vizSetting(): VizSetting | undefined {
    try {
      return this.metaData.setting.getVisualizationSetting();
    } catch (ex) {
      return void 0;
    }
  }

  get canShowFullScreen(): boolean {
    return DashboardModeModule.isViewMode && this.isEnableFullSize;
  }

  get viewMode(): string {
    return this.isFullSizeMode ? 'full-screen' : 'widget';
  }

  get enableMoreAction(): boolean {
    const isShowingSetting = DataBuilderModule.isShowingSetting;
    return !isShowingSetting;
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

  private get dashboardMode(): DashboardMode {
    return DashboardModeModule.mode;
  }

  private get isTableChart(): boolean {
    return this.metaData.setting instanceof AbstractTableQuerySetting;
  }

  private get isPivotTableChart(): boolean {
    return PivotTableQuerySetting.isPivotChartSetting(this.metaData.setting);
  }

  private get isTabFilter(): boolean {
    return this.metaData.setting.className === QuerySettingType.TabFilter;
  }

  private get isDropdownFilter(): boolean {
    return this.metaData.setting instanceof DropdownQuerySetting;
  }

  private get chartWidgetClass() {
    if (this.hasData) {
      return {
        'table-container': this.isTableChart || this.isPivotTableChart,
        'dropdown-container': this.isDropdownFilter,
        'tab-filter-container': this.isTabFilter,
        'chart-container': !(this.isTableChart || this.isPivotTableChart) && !this.isDropdownFilter && !this.isTabFilter,
        'p-0 preview-container': this.isPreview,
        'non-interactive': this.showEditComponent
      };
    } else {
      return {
        'w-100 h-100': true,
        'non-interactive': this.showEditComponent
      };
    }
  }

  private get backgroundColor(): string {
    let backgroundColor = this.metaData.backgroundColor;
    const vizSetting = this.metaData.setting?.getVisualizationSetting();
    if (vizSetting) {
      backgroundColor = vizSetting.getBackgroundColor();
    }
    return backgroundColor ?? '#00000019';
  }

  isAffectByFilter(): boolean {
    return !DashboardControllerModule.unAffectByFilters.has(this.metaData.id);
  }

  getFilterRequests(): FilterRequest[] {
    return [
      FilterModule.crossFilter,
      ...FilterModule.filterRequests.values(),
      ...Array.from(FilterModule.mainFilterWidgets.values()).map(widget => widget.toFilterRequest())
    ].filter((filter): filter is FilterRequest => {
      return filter?.filterId != this.metaData.id && filter instanceof FilterRequest;
    });
  }

  hasFilter(): boolean {
    return this.getFilterRequests().length > 0;
  }

  @Watch('response')
  onChartDataChanged() {
    if (!this.hasData) {
      this.handleOnRendered();
    }
  }

  // @Provide()
  // zoomOut() {
  //   ZoomModule.zoomChart({
  //     chart: this.metaData,
  //     type: ZoomType.zoomOut
  //   });
  //   return DashboardControllerModule.renderChartOrFilter({ widget: this.metaData, forceFetch: false });
  // }

  @Provide()
  zoom(nextLvl: string) {
    ZoomModule.zoomChart({ chart: this.metaData, nextLvl: nextLvl });
    return DashboardControllerModule.renderChartOrFilter({ widget: this.metaData, forceFetch: false });
  }

  @Provide()
  async onAddFilter(selectOption: SelectOption): Promise<void> {
    if (FilterUtils.isFilter(this.metaData)) {
      const widgetId: WidgetId = this.metaData.id;
      const querySetting: QuerySetting = QuerySettingModule.buildQuerySetting(widgetId);
      const filterRequest: FilterRequest | undefined = this.buildFilterRequest(widgetId, querySetting, selectOption);
      if (filterRequest) {
        await DashboardControllerModule.applyFilterRequest(filterRequest);
        // this.$emit('')
      }
    }
  }

  @Provide()
  async onAddMultiFilter(filters: SelectOption[]): Promise<void> {
    const isEmptyFilters = ListUtils.isEmpty(filters);
    if (isEmptyFilters) {
      return this.handleRemoveFilter(this.metaData);
    } else {
      if (FilterUtils.isFilter(this.metaData)) {
        const widgetId: WidgetId = this.metaData.id;
        const querySetting: QuerySetting = QuerySettingModule.buildQuerySetting(widgetId);
        const filterRequest: FilterRequest | undefined = this.buildFilterRequestWithMultiValue(widgetId, querySetting, filters);
        if (filterRequest) {
          return DashboardControllerModule.applyFilterRequest(filterRequest);
        }
      }
    }
  }

  @Provide()
  onRemoveFilter(): Promise<void> {
    const isFilter: boolean = FilterUtils.isFilter(this.metaData);
    if (isFilter) {
      return this.handleRemoveFilter(this.metaData);
    }
    return Promise.resolve();
  }

  @Provide()
  async onChangeFilterApply(on: boolean): Promise<void> {
    const isCrossFilterActivated = FilterModule.crossFilter?.filterId === this.metaData.id;
    if (isCrossFilterActivated) {
      await DashboardControllerModule.handleRemoveCrossFilter();
    }
    if (on) {
      return await DashboardControllerModule.applyFilterToWidget(this.metaData);
    } else {
      return await DashboardControllerModule.ignoreWidgetFromFilters(this.metaData);
    }
  }

  @Provide()
  async onCrossFilterChanged(selectOption: SelectOption): Promise<void> {
    const isCrossFilterActivated = FilterModule.isCrossFilterActivated(this.metaData.id, selectOption.data);
    if (isCrossFilterActivated) {
      return DashboardControllerModule.handleRemoveCrossFilter();
    } else {
      const widgetId: WidgetId = this.metaData.id;
      const querySetting: QuerySetting = QuerySettingModule.buildQuerySetting(widgetId);
      const filterRequest: FilterRequest | undefined = this.buildFilterRequest(widgetId, querySetting, selectOption);
      if (filterRequest) {
        return DashboardControllerModule.handleUpdateCrossFilter(filterRequest);
      }
    }
  }

  private handleHover(isHovered: boolean) {
    this.isHovered = isHovered;
  }

  private clickSeeMore(event: Event) {
    const menuOptions: ContextMenuItem[] = [];
    if (this.metaData && this.metaData.className === Widgets.Chart && this.metaData.extraData) {
      menuOptions.push(...this.menuOptions);
    } else {
      menuOptions.push(...this.menuOptions.filter(item => item.text != DashboardOptions.CONFIG_CHART));
    }
    DashboardModalModule.showContextMenu({
      event: event,
      items: menuOptions
    });
  }

  @Provide()
  private handleEditChart() {
    DashboardModalModule.hideContextMenu();
    const dashboardId = DashboardModule.id;
    if (dashboardId) {
      const dataManager = DI.get(DataManager);
      dataManager.saveDashboardId(dashboardId.toString());
      dataManager.saveWidget(this.metaData);
      dataManager.saveChartBuilderMode(BuilderMode.edit);
      RouteUtils.navigateToDataBuilder(this.$route, FilterModule.routerFilters);
    }
  }

  @Provide()
  private handleEditTitle() {
    DashboardModalModule.hideContextMenu();

    DashboardModalModule.showEditChartTextModal({
      data: this.metaData
    });
  }

  @Provide()
  private async duplicateChart(): Promise<void> {
    DashboardModalModule.hideContextMenu();

    const newWidget: Widget = await WidgetModule.handleDuplicateWidget(this.metaData);
    if (QueryRelatedWidget.isQueryRelatedWidget(newWidget)) {
      ZoomModule.registerZoomData(cloneDeep(newWidget));
      DashboardControllerModule.setAffectFilterWidget(newWidget);
      QuerySettingModule.setQuerySetting({ id: newWidget.id, query: newWidget.setting });
      await DashboardControllerModule.renderChartOrFilter({ widget: newWidget, forceFetch: true });
    }
  }

  @Provide()
  private deleteChart() {
    if (this.remove) {
      this.remove(() => {
        DashboardModalModule.hideContextMenu();
        WidgetModule.handleDeleteWidget(this.metaData).catch(ex => {
          PopupUtils.showError('Can not remove widget, refresh page and try again');
        });
        this.onRemoveFilter();
      });
    }
  }

  private retryLoadData() {
    ZoomModule.registerZoomData(this.metaData);
    DashboardControllerModule.setAffectFilterWidget(this.metaData);
    DashboardControllerModule.renderChartOrFilter({ widget: this.metaData, forceFetch: true });
  }

  private handleOnRendered() {
    Log.debug('ChartContainer::handleOnRendered', this.metaData.id);
    this.$nextTick(() => {
      RenderControllerModule.completeRender(this.metaData.id);
    });
  }

  private handleRemoveFilter(filter: ChartInfo) {
    return DashboardControllerModule.resetFilterRequest(filter.id);
  }

  private buildFilterRequest(id: WidgetId, querySetting: QuerySetting, selectOption: SelectOption): FilterRequest | undefined {
    const filterColumn: TableColumn | undefined = FilterUtils.getFilterColumn(querySetting);
    if (filterColumn) {
      const condition: Equal = ConditionUtils.buildEqualCondition(filterColumn, selectOption.data);
      const request: FilterRequest = new FilterRequest(id, condition);
      return request;
    } else {
      return void 0;
    }
  }

  private buildFilterRequestWithMultiValue(id: WidgetId, querySetting: QuerySetting, selectOptions: SelectOption[]): FilterRequest | undefined {
    const filterColumn: TableColumn | undefined = FilterUtils.getFilterColumn(querySetting);
    if (filterColumn) {
      Log.debug(
        'value to build IN condition: ',
        selectOptions.map(option => option.data)
      );
      const condition: In = ConditionUtils.buildInCondition(
        filterColumn,
        selectOptions.map(option => option.data)
      );
      const request: FilterRequest = new FilterRequest(id, condition);
      return request;
    } else {
      return void 0;
    }
  }

  private showFullSize() {
    this.$root.$emit(DashboardEvents.showWidgetFullSize, this.metaData);
  }

  private hideFullSize() {
    this.$root.$emit(DashboardEvents.hideWidgetFullSize);
  }

  private handleChartRenderError(ex: any) {
    const exception = DIException.fromObject(ex);
    DataModule.setStatusError({ id: this.metaData.id, message: exception.message });
  }
}

export interface FilterListener {
  onAddFilter(value: SelectOption): void;

  onAddMultiFilter(filters: SelectOption[]): void;

  onRemoveFilter(): void;

  onChangeFilterApply(enable: boolean): void;
}

export interface CrossFilterListener {
  onCrossFilterChanged(value: SelectOption): void;
}
