/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 11:17 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 11/26/20, 6:47 PM
 */

import { AbstractTableQuerySetting, CompareRequest, FilterRequest } from '@core/domain';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { Paginatable } from '@core/domain/Model/Query/Features/Paginatable';

export class QueryRequest {
  constructor(
    public querySetting: QuerySetting,
    public filterRequests: FilterRequest[] = [],
    public compareRequest?: CompareRequest,
    /**
     * @min from -1
     */
    public from: number = -1,
    /**
     * @min from -1
     */
    public size: number = -1
  ) {}

  static fromQuery(querySetting: QuerySetting, from: number, size: number) {
    return new QueryRequest(querySetting, [], void 0, from, size);
  }

  handleSetDefaultPagination(): void {
    if (Paginatable.isPaginatable(this.querySetting)) {
      this.from = this.querySetting.getFrom();
      this.size = this.querySetting.getSize();
    } else {
      this.from = -1;
      this.size = -1;
    }
  }

  setPaging(from: number, size: number) {
    this.from = from;
    this.size = size;
  }
}

export class TrackingProfileSearchRequest {
  constructor(
    public querySetting: AbstractTableQuerySetting,
    public filterRequests: FilterRequest[] = [],
    public from: number = -1,
    public size: number = -1
  ) {}
}
