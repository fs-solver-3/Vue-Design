/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:03 PM
 */

import { Job, JobInfo } from '@core/DataIngestion/Domain/Job/Job';
import { JobRepository } from '@core/DataIngestion/Repository/JobRepository';
import { Inject } from 'typescript-ioc';
import { DIException, JobId } from '@core/domain';
import { ListingResponse } from '@core/DataIngestion';

export abstract class JobService {
  abstract create(request: Job): Promise<JobInfo>;

  abstract list(from: number, size: number): Promise<ListingResponse<JobInfo>>;

  abstract delete(id: JobId): Promise<boolean>;

  abstract update(id: JobId, job: Job): Promise<boolean>;

  abstract testConnection(job: Job): Promise<boolean>;

  abstract forceSync(job: Job): Promise<boolean>;
}

export class JobServiceImpl implements JobService {
  constructor(@Inject private jobRepository: JobRepository) {}

  create(request: Job): Promise<JobInfo> {
    return this.jobRepository.create(request);
  }

  delete(id: JobId): Promise<boolean> {
    return this.jobRepository.delete(id);
  }

  list(from: number, size: number): Promise<ListingResponse<JobInfo>> {
    return this.jobRepository.list(from, size);
  }

  update(id: JobId, job: Job): Promise<boolean> {
    return this.jobRepository.update(id, job);
  }

  testConnection(job: Job): Promise<boolean> {
    return this.jobRepository.testConnection(job).then(response => response.success);
  }

  forceSync(job: Job): Promise<boolean> {
    return this.jobRepository.forceSync(job).then(response => response.success);
  }
}
