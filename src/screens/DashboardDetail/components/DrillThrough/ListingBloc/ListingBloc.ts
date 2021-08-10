/*
 * @author: tvc12 - Thien Vi
 * @created: 7/19/21, 8:18 PM
 */

import { Bloc } from '@/shared/Bloc';
import { ListingEvent, LoadMoreDashboard, ReloadDashboard, SearchDashboard } from '@/screens/DashboardDetail/components/DrillThrough/ListingBloc/ListingEvent';
import { ListingError, ListingLoaded, ListingLoading, ListingState } from '@/screens/DashboardDetail/components/DrillThrough/ListingBloc/ListingState';
import { DirectoryService } from '@core/services';
import { Inject } from 'typescript-ioc';
import { DIException, Directory, DirectoryType, ListDirectoryRequest, PageResult, Sort, SortDirection } from '@core/domain';
import { Log } from '@core/utils';
import { DashboardModule } from '@/screens/DashboardDetail/stores';

// Abstract here in the feature
export class ListingBloc extends Bloc<ListingEvent, ListingState> {
  @Inject
  private readonly directoryService!: DirectoryService;
  private keyword = '';
  private dashboards: Directory[] = [];
  private readonly size = 40;
  private isLoadMore = false;
  private canLoadMore = true;

  constructor() {
    super(new ListingLoaded([]));
  }

  get data() {
    const id = DashboardModule.id;
    return this.dashboards.filter(dashboard => dashboard.dashboardId != id);
  }

  private get from() {
    return this.dashboards.length;
  }

  reload() {
    this.add(new ReloadDashboard());
  }

  search(keyword: string) {
    this.add(new SearchDashboard(keyword));
  }

  loadMore() {
    if (this.canLoadMore && !this.isLoadMore) {
      this.add(new LoadMoreDashboard());
    }
  }

  protected async *mapEventToState(event: ListingEvent): AsyncIterableIterator<ListingState> {
    switch (event.constructor) {
      case SearchDashboard:
        yield* this.handleSearch(event as SearchDashboard);
        break;
      case LoadMoreDashboard:
        yield* this.handleLoadMore(event as LoadMoreDashboard);
        break;
      case ReloadDashboard:
        yield* this.handleReload(event as ReloadDashboard);
        break;
    }
  }

  private async *handleSearch(event: SearchDashboard) {
    try {
      yield new ListingLoading();
      this.keyword = event.keyword;
      const { data, total } = await this.getDashboard(this.keyword, 0, this.size);
      this.dashboards = data;
      this.canLoadMore = this.from < total;
      yield new ListingLoaded(this.data);
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      Log.error('handleSearch::ex', exception);
      yield new ListingError(exception.message);
    }
  }

  private async *handleLoadMore(event: LoadMoreDashboard) {
    if (this.isLoadMore) {
      return;
    } else {
      try {
        this.isLoadMore = true;
        const { total, data } = await this.getDashboard(this.keyword, this.from, this.size);
        this.dashboards.push(...data);
        this.canLoadMore = this.from < total;
        yield new ListingLoaded(this.data);
      } catch (ex) {
        const exception = DIException.fromObject(ex);
        Log.error('handleLoadMore::ex', exception);
        yield new ListingError(exception.message);
      } finally {
        this.isLoadMore = false;
      }
    }
  }

  private async *handleReload(event: ReloadDashboard) {
    try {
      yield new ListingLoading();
      const { data, total } = await this.getDashboard(this.keyword, 0, this.size);
      this.dashboards = data;
      this.canLoadMore = this.from < total;
      yield new ListingLoaded(this.data);
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      Log.error('handleReload::ex', exception);
      yield new ListingError(exception.message);
    }
  }

  private getDashboard(keyword: string, from: number, size: number): Promise<PageResult<Directory>> {
    return this.directoryService.quickList(
      new ListDirectoryRequest({
        from: from,
        size: size,
        sorts: [new Sort({ field: 'name', order: SortDirection.Asc })],
        directoryType: DirectoryType.Dashboard,
        isRemoved: false
      })
    );
  }
}
