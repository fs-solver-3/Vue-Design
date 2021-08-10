/*
 * @author: tvc12 - Thien Vi
 * @created: 5/25/21, 5:00 PM
 */

import { Dashboard, DynamicFilter, FilterRequest, FilterWidget, MainDateFilterMode, WidgetId } from '@core/domain';
import { DateRange, Stores } from '@/shared';
import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { DashboardModule, MainDateData } from '@/screens/DashboardDetail/stores/dashboard/DashboardStore';
import { DataManager } from '@core/services';
import { DI } from '@core/modules';
import { DateUtils, FilterUtils, TimeoutUtils } from '@/utils';
import { DashboardControllerModule } from '@/screens/DashboardDetail/stores/controller/DataControllerStore';
import { MainDateCompareRequest } from '@/screens/DashboardDetail/stores/controller/DataStore';
import { Log } from '@core/utils';
import router from '@/router/router';
import { RouteUtils } from '@/utils/routes.utils';

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.filterStore })
export class FilterStore extends VuexModule implements FilterRequestHandler, CrossFilterHandler, MainFilterHandler, MainDateFilterHandler {
  mainFilterWidgets: Map<WidgetId, FilterWidget> = new Map<WidgetId, FilterWidget>();
  filterRequests: Map<WidgetId, FilterRequest> = new Map<WidgetId, FilterRequest>();
  crossFilter: FilterRequest | null = null;
  //Main date Filter
  chosenRange: DateRange | null = null;
  compareRange: DateRange | null = null;
  // filter in routers
  routerFilters: DynamicFilter[] = [];

  get getAllFilters(): (id: WidgetId) => FilterRequest[] {
    return id => {
      if (!DashboardControllerModule.isAffectedByFilter(id)) return [];
      else
        return [
          this.crossFilter,
          ...this.filterRequests.values(),
          ...Array.from(this.mainFilterWidgets.values()).map(widget => widget.toFilterRequest())
        ].filter((filter): filter is FilterRequest => filter instanceof FilterRequest);
    };
  }

  get crossFilterValue(): string | undefined {
    return FilterUtils.getFilterValue(this.crossFilter?.condition);
  }

  /**
   * Main Date Filter Handler Implement
   */
  get mainDateCompareRequest(): MainDateCompareRequest {
    return {
      field: DashboardModule.mainDateFilter?.affectedField!,
      currentRange: this.chosenRange,
      compareRange: this.compareRange
    };
  }

  get isCrossFilterActivated(): (id: WidgetId, data?: any) => boolean {
    return (id, data) => {
      return this.crossFilterValue === data && this.crossFilter?.filterId === id;
    };
  }

  private static getDataManager(): DataManager {
    return DI.get(DataManager);
  }

  @Mutation
  applyCrossFilter(request: FilterRequest): void {
    this.crossFilter = request;
  }

  @Mutation
  resetCrossFilter(): void {
    this.crossFilter = null;
  }

  @Mutation
  applyFilterRequest(request: FilterRequest): void {
    this.filterRequests.set(request.filterId, request);
  }

  @Mutation
  removeFilterRequest(id: WidgetId): void {
    this.filterRequests.delete(id);
  }

  @Mutation
  addMainFilter(widget: FilterWidget): void {
    this.mainFilterWidgets.set(widget.id, widget);
  }

  @Mutation
  setMainFilters(widgets: FilterWidget[]): void {
    this.mainFilterWidgets.clear();
    const widgetMap: [WidgetId, FilterWidget][] = widgets.map(widget => [widget.id, widget]);
    this.mainFilterWidgets = new Map<WidgetId, FilterWidget>(widgetMap);
  }

  @Mutation
  removeMainFilter(id: WidgetId): void {
    this.mainFilterWidgets.delete(id);
  }

  @Mutation
  loadLocalMainFilters(dashboard: Dashboard) {
    const localMainFilters = FilterStore.getDataManager().getMainFilters(dashboard.id.toString());
    const filters = RouteUtils.getFilters(router.currentRoute);
    this.routerFilters = filters;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    FilterModule.setMainFilters(localMainFilters.concat(filters));
  }

  @Mutation
  reset() {
    this.mainFilterWidgets.clear();
    this.filterRequests.clear();
    this.crossFilter = null;
    // Reset Main date filter
    this.chosenRange = null;
    this.compareRange = null;
    this.routerFilters = [];
  }

  @Mutation
  setFilterRequest(request: FilterRequest[]): void {
    this.filterRequests.clear();
    const filters: [WidgetId, FilterRequest][] = request.map(request => [request.filterId, request]);
    this.filterRequests = new Map<WidgetId, FilterRequest>(filters);
  }

  @Mutation
  loadDateRangeFilter(payload: MainDateData): void {
    if (payload.mode == MainDateFilterMode.custom) {
      this.chosenRange = payload.chosenDateRange!;
    } else {
      this.chosenRange = DateUtils.getChosenDateRange(payload.mode);
    }
  }

  @Mutation
  setCompareRange(range: DateRange | null) {
    this.compareRange = range;
  }

  @Mutation
  setChosenRange(range: DateRange | null) {
    this.chosenRange = range;
  }

  @Mutation
  handleMainDateFilterChange(): void {
    Log.debug('handleMainDateFilterChange:: handleApplyFilter');
    TimeoutUtils.waitAndExec(null, () => DashboardControllerModule.handleApplyFilter(), 150);
  }

  @Mutation
  setRouterFilters(routerFilters: DynamicFilter[]) {
    this.routerFilters = routerFilters;
  }
}

export const FilterModule = getModule(FilterStore);

export abstract class FilterRequestHandler {
  abstract applyFilterRequest(request: FilterRequest): void;

  abstract setFilterRequest(request: FilterRequest[]): void;

  abstract removeFilterRequest(id: WidgetId): void;
}

export abstract class CrossFilterHandler {
  abstract get crossFilterValue(): string | undefined;

  abstract get isCrossFilterActivated(): (id: WidgetId, data?: any) => boolean;

  abstract applyCrossFilter(request: FilterRequest): void;

  abstract resetCrossFilter(): void;
}

export abstract class MainFilterHandler {
  abstract addMainFilter(widget: FilterWidget): void;

  abstract setMainFilters(widgets: FilterWidget[]): void;

  abstract removeMainFilter(id: WidgetId): void;

  abstract loadLocalMainFilters(dashboard: Dashboard): void;
}

export abstract class MainDateFilterHandler {
  abstract get mainDateCompareRequest(): MainDateCompareRequest;

  abstract loadDateRangeFilter(payload: MainDateData): void;

  abstract setCompareRange(range: DateRange | null): void;

  abstract setChosenRange(range: DateRange | null): void;
}
