/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 3:00 PM
 */

export class ListingResponse<ListingData> {
  data: ListingData[];
  total: number;
  constructor(data: ListingData[], total: number) {
    this.data = data;
    this.total = total;
  }
}

import { JobHistory, ListingJobHistoryRequest } from '@core/DataIngestion';
import { InjectValue } from 'typescript-ioc';
import { DIKeys } from '@core/modules';
import { BaseClient } from '@core/services/base.service';

export abstract class JobHistoryRepository {
  abstract list(request: ListingJobHistoryRequest): Promise<ListingResponse<JobHistory>>;
}

export class JobHistoryRepositoryImpl implements JobHistoryRepository {
  @InjectValue(DIKeys.authClient)
  private readonly httpClient!: BaseClient;
  private readonly apiPath = 'scheduler/history';

  list(request: ListingJobHistoryRequest): Promise<ListingResponse<JobHistory>> {
    return this.httpClient.post<ListingResponse<JobHistory>>(`${this.apiPath}/list`, request);
  }
}
