/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:00 PM
 */

import { JobHistory, ListingJobHistoryRequest, ListingResponse } from '@core/DataIngestion';
import { JobHistoryRepository } from '@core/DataIngestion/Repository/JobHistoryRepository';
import { Inject } from 'typescript-ioc';

export abstract class JobHistoryService {
  abstract list(request: ListingJobHistoryRequest): Promise<ListingResponse<JobHistory>>;
}

export class JobHistoryServiceImpl implements JobHistoryService {
  @Inject
  private readonly historyRepository!: JobHistoryRepository;

  list(request: ListingJobHistoryRequest): Promise<ListingResponse<JobHistory>> {
    return this.historyRepository.list(request);
  }
}
