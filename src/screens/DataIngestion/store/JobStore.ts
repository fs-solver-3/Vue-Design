import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared';
import { Job, JobInfo } from '@core/DataIngestion/Domain/Job/Job';
import { Inject } from 'typescript-ioc';
import { JobService } from '@core/DataIngestion/Service/JobService';
import { Log } from '@core/utils';
import { HeaderData } from '@/shared/models';
import { DIException, JobId } from '@core/domain';
import { ListingResponse } from '@core/DataIngestion';

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.jobStore })
class JobStore extends VuexModule {
  jobList: JobInfo[] = [];
  totalRecord = 0;

  @Inject
  private readonly jobService!: JobService;

  get jobHeaders(): HeaderData[] {
    return [
      {
        key: 'displayName',
        label: 'Name',
        disableSort: true
      },
      {
        key: 'sourceName',
        label: 'Source Name',
        disableSort: true
        // width: 168
      },
      {
        key: 'syncMode',
        label: 'Sync Mode',
        disableSort: true
        // width: 168
      },
      {
        key: 'customLastSyncStatus',
        label: 'Last Sync Status',
        disableSort: true
        // width: 195
      },
      {
        key: 'customCurrentSyncStatus',
        label: 'Current Sync Status',
        disableSort: true
        // width: 195
      },
      {
        key: 'action',
        label: 'Action',
        disableSort: true,
        width: 260
      }
    ];
  }

  @Action
  loadJobList(payload: { from: number; size: number }) {
    return this.jobService
      .list(payload.from, payload.size)
      .then(response => {
        this.setJobList(response);
      })
      .catch(e => {
        const exception = DIException.fromObject(e);
        Log.error('JobStore::loadJobList::exception::', exception.message);
        throw new DIException(exception.message);
      });
  }

  @Mutation
  setJobList(response: ListingResponse<JobInfo>) {
    this.jobList = response.data;
    this.totalRecord = response.total;
  }

  @Action
  deleteJob(jobId: JobId) {
    return this.jobService.delete(jobId);
  }

  @Action
  create(job: Job): Promise<JobInfo> {
    return this.jobService.create(job);
  }

  @Action
  update(job: Job) {
    return this.jobService.update(job.jobId, job);
  }

  @Action
  testJobConnection(job: Job): Promise<boolean> {
    return this.jobService.testConnection(job);
  }

  @Action
  forceSync(job: Job): Promise<boolean> {
    return this.jobService.forceSync(job);
  }
}

export const JobModule = getModule(JobStore);
