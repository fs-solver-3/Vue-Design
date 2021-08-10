/*
 * @author: tvc12 - Thien Vi
 * @created: 11/27/20, 10:30 AM
 */

import { InjectValue } from 'typescript-ioc';
import { DIKeys } from '@core/modules';
import { BaseClient } from '@core/services/base.service';
import { VisualizationResponse } from '@core/domain/Response';
import { QueryRequest } from '@core/domain/Request';

export abstract class QueryRepository {
  abstract query(request: QueryRequest): Promise<VisualizationResponse>;
}

export class QueryRepositoryImpl implements QueryRepository {
  private apiPath = '/chart';

  constructor(@InjectValue(DIKeys.authClient) private baseClient: BaseClient) {}

  query(request: QueryRequest): Promise<VisualizationResponse> {
    return this.baseClient.post(`${this.apiPath}/query`, request).then(obj => VisualizationResponse.fromObject(obj));
  }
}
