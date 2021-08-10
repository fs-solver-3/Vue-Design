/*
 * @author: tvc12 - Thien Vi
 * @created: 5/25/21, 5:00 PM
 */

import {
  AbstractTableResponse,
  ChartInfo,
  CompareRequest,
  Condition,
  DIException,
  FilterRequest,
  PivotTableQuerySetting,
  QueryRelatedWidget,
  QueryRequest,
  QuerySetting,
  TableColumn,
  VisualizationResponse,
  VizSettingType,
  WidgetId
} from '@core/domain';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { ListUtils, QuerySettingUtils, TimeoutUtils } from '@/utils';
import {
  DashboardModule,
  DataModule,
  FilterModule,
  MainDateCompareRequest,
  QuerySettingModule,
  RenderControllerModule,
  WidgetModule
} from '@/screens/DashboardDetail/stores';
import { CompareResolvers, DashboardService } from '@core/services';
import { Inject } from 'typescript-ioc';
import { Stores } from '@/shared';
import { ZoomModule } from '@/store/modules/zoom.store';
import { ConditionUtils, Log } from '@core/utils';
import { Pagination, RowData } from '@/shared/models';
import { cloneDeep } from 'lodash';

export const getCompareRequest = (querySetting: QuerySetting, mainDateData: MainDateCompareRequest): CompareRequest | undefined => {
  if (mainDateData.compareRange && mainDateData.currentRange) {
    const chartType = querySetting.getVisualizationSetting()?.className ?? VizSettingType.TableSetting;
    return CompareResolvers.mainDateCompareResolver()
      .withField(mainDateData.field)
      .withChartType(chartType)
      .withCurrentRange(mainDateData.currentRange)
      .withCompareRange(mainDateData.compareRange)
      .build();
  } else {
    return void 0;
  }
};

export const handleGetMainFilterRequest = (mainDateCompareRequest: MainDateCompareRequest): FilterRequest | undefined => {
  if (mainDateCompareRequest.currentRange) {
    const condition = ConditionUtils.buildMainDateCondition(mainDateCompareRequest.field, mainDateCompareRequest.currentRange);
    return new FilterRequest(-1, condition);
  } else {
    return void 0;
  }
};

const getChartQueryRequest = (payload: { widgetId: number; mainDateCompareRequest?: MainDateCompareRequest; pagination?: Pagination }): QueryRequest => {
  const { widgetId, mainDateCompareRequest, pagination } = payload;
  const filters: FilterRequest[] = FilterModule.getAllFilters(widgetId);
  const querySetting: QuerySetting = QuerySettingModule.buildQuerySetting(widgetId);

  let compareRequest: CompareRequest | undefined;
  if (mainDateCompareRequest) {
    compareRequest = getCompareRequest(querySetting, mainDateCompareRequest);
    if (!compareRequest) {
      const mainFilter = handleGetMainFilterRequest(mainDateCompareRequest);
      if (mainFilter) {
        filters.push(mainFilter);
      }
    }
  }

  const request = new QueryRequest(querySetting, filters, compareRequest, -1, -1);

  request.handleSetDefaultPagination();
  return request;
};

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.dataController })
export class DataControllerStore extends VuexModule {
  ignoreWidgets: Set<WidgetId> = new Set<WidgetId>();
  unAffectByFilters: Set<WidgetId> = new Set<WidgetId>();
  @Inject
  private dashboardService!: DashboardService;

  get isAffectedByFilter(): (id: WidgetId) => boolean {
    return id => !this.unAffectByFilters.has(id);
  }

  @Action({ rawError: true })
  async handleApplyFilter(): Promise<void> {
    const chartInfos: QueryRelatedWidget[] = WidgetModule.allQueryWidgets;
    if (chartInfos && ListUtils.isNotEmpty(chartInfos)) {
      RenderControllerModule.reset();
      RenderControllerModule.readyRequestRender();

      const allResults: Promise<void>[] = chartInfos.map(widget => {
        const isIgnoring = this.ignoreWidgets.has(widget.id);
        const isAffectedByFilter = !this.unAffectByFilters.has(widget.id);
        if (!isIgnoring && isAffectedByFilter) {
          const request: QueryRequest = getChartQueryRequest({
            widgetId: widget.id,
            mainDateCompareRequest: FilterModule.mainDateCompareRequest
          });

          return DataModule.renderChart({
            chartId: widget.id,
            forceFetch: false,
            request: request
          });
        } else {
          DataModule.refresh(widget.id);
          return Promise.resolve();
        }
      });
      await Promise.all(allResults);
    }
  }

  @Action
  async renderAllChartOrFilters(): Promise<void> {
    const widgets: QueryRelatedWidget[] = WidgetModule.allQueryWidgets;
    if (widgets && ListUtils.isNotEmpty(widgets)) {
      ZoomModule.loadZoomLevels(widgets);
      ZoomModule.registerMultiZoomData(widgets);
      const allChartResponse: Promise<void>[] = widgets.map(widget => {
        return this.renderChartOrFilter({
          widget: widget,
          forceFetch: true
        });
      });
      await Promise.all(allChartResponse);
    }
  }

  @Action
  renderChartOrFilter(payload: { widget: QueryRelatedWidget; forceFetch?: boolean }): Promise<void> {
    const { widget, forceFetch } = payload;
    const request: QueryRequest = getChartQueryRequest({
      widgetId: widget.id,
      mainDateCompareRequest: FilterModule.mainDateCompareRequest
    });

    return DataModule.renderChart({ chartId: widget.id, forceFetch: forceFetch ?? false, request: request });
  }

  @Action
  renderChart(payload: { id: WidgetId; forceFetch?: boolean }): Promise<void> {
    const { id, forceFetch } = payload;
    const request: QueryRequest = getChartQueryRequest({
      widgetId: id,
      mainDateCompareRequest: FilterModule.mainDateCompareRequest
    });
    return DataModule.renderChart({ chartId: id, forceFetch: forceFetch ?? false, request: request });
  }

  @Mutation
  reset() {
    this.ignoreWidgets.clear();
    this.unAffectByFilters.clear();
  }

  @Mutation
  clearIgnoreWidget() {
    this.ignoreWidgets.clear();
  }

  @Mutation
  setDashboardId(id: number) {
    DataModule.setDashboardId(id);
  }

  @Action
  handleError(ex: any) {
    Log.error('Dashboard::Store::ERROR', ex);
    if (ex instanceof DIException) {
      this.setError(ex);
    } else {
      this.setError(new DIException('Error, try a again'));
    }
  }

  @Mutation
  setError(exception: DIException) {
    DashboardModule.showError(exception.message);
  }

  @Mutation
  setFilterRequests(filterRequests: FilterRequest[]) {
    FilterModule.setFilterRequest(filterRequests);
    const currentIgnoreWidget = this.ignoreWidgets;
    this.ignoreWidgets.clear();
    this.ignoreWidgets = new Set([...currentIgnoreWidget, ...filterRequests.map(request => request.filterId)]);
    TimeoutUtils.waitAndExec(null, () => this.handleApplyFilter(), 150);
  }

  @Action
  handleAddCrossFilter(filter: FilterRequest): Promise<void> {
    this.addCrossFilter(filter);
    // Avoid standing ui
    TimeoutUtils.waitAndExec(null, () => this.handleApplyFilter(), 150);
    return Promise.resolve();
  }

  /**
   * Remove Current Cross filter and add new CrossFilter
   * @param filter
   */
  @Action
  handleUpdateCrossFilter(filter: FilterRequest): Promise<void> {
    const crossFilterId = FilterModule.crossFilter?.filterId ?? -1;
    this.ignoreWidgets.delete(crossFilterId);
    this.addCrossFilter(filter);
    // Avoid standing ui
    TimeoutUtils.waitAndExec(null, () => this.handleApplyFilter(), 150);
    return Promise.resolve();
  }

  @Action
  handleRemoveCrossFilter(): Promise<void> {
    const widgetId = FilterModule.crossFilter?.filterId ?? -1;
    FilterModule.resetCrossFilter();
    // Avoid standing ui
    TimeoutUtils.waitAndExec(null, () => this.handleApplyFilter(), 150);
    TimeoutUtils.waitAndExec(null, () => this.ignoreWidgets.delete(widgetId), 151);
    return Promise.resolve();
  }

  @Action
  applyFilterRequest(request: FilterRequest): Promise<void> {
    FilterModule.applyFilterRequest(request);
    this.ignoreWidgets.add(request.filterId);
    TimeoutUtils.waitAndExec(null, () => this.handleApplyFilter(), 150);
    return Promise.resolve();
  }

  @Action
  resetFilterRequest(id: WidgetId): Promise<void> {
    FilterModule.removeFilterRequest(id);
    TimeoutUtils.waitAndExec(null, () => this.handleApplyFilter().then(() => this.ignoreWidgets.delete(id)), 150);
    return Promise.resolve();
  }

  @Action
  async loadDataWithPagination(payload: { widgetId: number; pagination: Pagination }): Promise<VisualizationResponse> {
    const { widgetId, pagination } = payload;
    QuerySettingModule.applySort({ id: widgetId, sortAsMap: pagination.sortAsMap });

    const request: QueryRequest = await getChartQueryRequest({
      widgetId: widgetId,
      mainDateCompareRequest: FilterModule.mainDateCompareRequest,
      pagination: pagination
    });
    request.setPaging(pagination.from, pagination.size);
    return DataModule.query(request);
  }

  @Action
  async ignoreWidgetFromFilters(widget: ChartInfo) {
    this.unAffectByFilters.add(widget.id);
    return await this.renderChartOrFilter({ widget: widget, forceFetch: true });
  }

  @Action
  async applyFilterToWidget(widget: ChartInfo) {
    this.unAffectByFilters.delete(widget.id);
    return await this.renderChartOrFilter({ widget: widget, forceFetch: true });
  }

  @Mutation
  initAffectFilterWidgets(widgets: QueryRelatedWidget[]) {
    const unAffectFilterWidgetIds = widgets.filter(widget => !widget.setting.getVisualizationSetting()?.isAffectedByFilter()).map(widget => widget.id);
    this.unAffectByFilters = new Set<WidgetId>(unAffectFilterWidgetIds);
  }

  @Mutation
  setAffectFilterWidget(widget: QueryRelatedWidget) {
    if (widget.setting.getVisualizationSetting()?.isAffectedByFilter()) {
      this.unAffectByFilters.delete(widget.id);
    } else {
      this.unAffectByFilters.add(widget.id);
    }
  }

  @Mutation
  private addCrossFilter(filter: FilterRequest) {
    FilterModule.applyCrossFilter(filter);
    this.ignoreWidgets.add(filter.filterId);
  }

  @Action
  async loadSubRows(payload: { id: WidgetId; pagination: Pagination; currentRow: RowData; setting: PivotTableQuerySetting }): Promise<RowData[]> {
    const { id, setting, currentRow, pagination } = payload;
    const currentRequest: QueryRequest = getChartQueryRequest({
      widgetId: id,
      mainDateCompareRequest: FilterModule.mainDateCompareRequest,
      pagination: cloneDeep(pagination)
    });
    currentRequest.querySetting = await this.buildSubRowQuerySetting({ setting: setting, currentRow: currentRow });
    const response: AbstractTableResponse = (await DataModule.query(currentRequest)) as AbstractTableResponse;
    return response.records as any;
  }

  @Action
  async buildSubRowQuerySetting(payload: { currentRow: RowData; setting: PivotTableQuerySetting }): Promise<PivotTableQuerySetting> {
    const { currentRow, setting } = payload;
    const currentLevel = currentRow.depth ?? 0;
    const clonedSetting = cloneDeep(setting);
    const equalConditions: Condition[] = QuerySettingUtils.buildEqualConditions(clonedSetting.rows, currentRow);
    clonedSetting.filters.push(...equalConditions);
    const nextFunction = clonedSetting.rows[currentLevel + 1];
    clonedSetting.rows = [nextFunction];
    return clonedSetting;
  }
}

export const DashboardControllerModule = getModule(DataControllerStore);
