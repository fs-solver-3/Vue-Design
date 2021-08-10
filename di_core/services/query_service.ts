/*
 * @author: tvc12 - Thien Vi
 * @created: 11/27/20, 10:26 AM
 */

import { Inject } from 'typescript-ioc';
import { QueryRepository } from '@core/repositories';
import { VisualizationResponse } from '@core/domain/Response';
import { QueryRequest } from '@core/domain/Request';
import { cloneDeep } from 'lodash';

export abstract class QueryService {
  abstract query(request: QueryRequest): Promise<VisualizationResponse>;
}

export class QueryServiceImpl implements QueryService {
  constructor(@Inject private repository: QueryRepository) {}

  query(request: QueryRequest): Promise<VisualizationResponse> {
    const newRequest = this.removeUnusedData(request);
    return this.repository.query(newRequest);
  }

  private removeUnusedData(request: QueryRequest): QueryRequest {
    const newRequest = cloneDeep(request);
    newRequest.querySetting.options = {};
    return newRequest;
  }
}
