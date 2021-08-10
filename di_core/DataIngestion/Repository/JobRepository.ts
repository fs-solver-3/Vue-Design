/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:03 PM
 */

import { Job, JobInfo } from '@core/DataIngestion/Domain/Job/Job';
import { BaseClient } from '@core/services/base.service';
import { InjectValue } from 'typescript-ioc';
import { DIKeys } from '@core/modules';
import { JobId } from '@core/domain';
import { ListingResponse } from '@core/DataIngestion';
import { BaseResponse } from '@core/DataIngestion/Domain/Response/BaseResponse';

const headerScheduler = {
  'Content-Type': 'application/json',
  'access-token': 'job$cheduler@datainsider.co'
};

export abstract class JobRepository {
  abstract create(request: Job): Promise<JobInfo>;

  abstract list(from: number, size: number): Promise<ListingResponse<JobInfo>>;

  abstract delete(id: JobId): Promise<boolean>;

  abstract update(id: JobId, job: Job): Promise<boolean>;

  abstract testConnection(job: Job): Promise<BaseResponse>;

  abstract forceSync(job: Job): Promise<BaseResponse>;
}

export class JobRepositoryImpl extends JobRepository {
  @InjectValue(DIKeys.authClient)
  private readonly httpClient!: BaseClient;
  private readonly apiPath = 'scheduler/job';

  create(request: Job): Promise<JobInfo> {
    return this.httpClient.post(`${this.apiPath}/create`, request, void 0, headerScheduler).then(jobInfo => JobInfo.fromObject(jobInfo));
  }

  list(from: number, size: number): Promise<ListingResponse<JobInfo>> {
    return this.httpClient
      .post<any>(
        `${this.apiPath}/list`,
        {
          from: from,
          size: size
        },
        void 0,
        headerScheduler
      )
      .then(response => new ListingResponse<JobInfo>(this.parseToListJob(response.data), response.total));
  }

  delete(jobId: JobId): Promise<boolean> {
    return this.httpClient.delete<boolean>(`${this.apiPath}/${jobId}`, void 0, void 0, headerScheduler);
  }

  update(id: JobId, job: Job): Promise<boolean> {
    return this.httpClient.put<boolean>(`${this.apiPath}/${id}`, job, void 0, headerScheduler);
  }

  testConnection(job: Job): Promise<BaseResponse> {
    return this.httpClient.post(`worker/job/test`, job, void 0, headerScheduler);
  }

  private parseToListJob(listObjects: any[]): JobInfo[] {
    return listObjects.map(obj => JobInfo.fromObject(obj));
  }

  forceSync(job: Job): Promise<BaseResponse> {
    return this.httpClient.put(`scheduler/schedule/job/${job.jobId}/now`, job, void 0, headerScheduler);
  }
}
