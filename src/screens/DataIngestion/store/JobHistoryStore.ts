import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared';
import { JobHistory, JobHistoryService, ListingJobHistoryRequest, ListingResponse, SortRequest } from '@core/DataIngestion';
import { Inject } from 'typescript-ioc';
import { HeaderData } from '@/shared/models';
import { Log } from '@core/utils';
import { DIException, SortDirection } from '@core/domain';

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.jobHistoryStore })
class JobHistoryStore extends VuexModule {
  jobHistoryList: JobHistory[] = [];
  totalRecord = 0;

  @Inject
  private readonly jobHistoryService!: JobHistoryService;

  get jobHistoryHeaders(): HeaderData[] {
    return [
      {
        key: 'syncId',
        label: 'Sync Id',
        isGroupBy: true,
        disableSort: true
      },
      {
        key: 'jobId',
        label: 'Job Id',
        isGroupBy: true,
        disableSort: true
      },
      {
        key: 'lastSyncTime',
        label: 'Last Time Sync',
        disableSort: true
      },
      {
        key: 'totalSyncedTime',
        label: 'Total Synced Time',
        disableSort: true
      },
      {
        key: 'customStatus',
        label: 'Status',
        disableSort: true
      },
      {
        key: 'message',
        label: 'Message',
        disableSort: true
      },
      {
        key: 'totalRowsInserted',
        label: 'Total Inserted Rows',
        disableSort: true
      }
    ];
  }

  @Action
  loadJobHistoryList(payload: { from: number; size: number }) {
    const request = new ListingJobHistoryRequest(payload.from, payload.size, [new SortRequest('id', SortDirection.Desc)]);
    return this.jobHistoryService
      .list(request)
      .then(response => {
        this.setJobHistoryList(response);
      })
      .catch(e => {
        const exception = DIException.fromObject(e);
        Log.error('JobHistoryStore::loadJobHistoryList::exception::', exception.message);
        throw new DIException(exception.message);
      });
  }

  @Mutation
  setJobHistoryList(response: ListingResponse<JobHistory>) {
    this.jobHistoryList = response.data;
    this.totalRecord = response.total;
  }
}
export const JobHistoryModule = getModule(JobHistoryStore);
