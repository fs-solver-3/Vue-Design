/*
 * @author: tvc12 - Thien Vi
 * @created: 5/27/21, 11:32 AM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/10/20, 2:44 PM
 */

import { VizResponseType } from '@core/domain/Response/Query/VisualizationResponse';
import { TableResponse } from '@core/domain/Response/Query/TableResponse';
import { AbstractTableResponse, MinMaxData } from '@core/domain/Response/Query/AbstractTableResponse';

export class GroupTableResponse extends AbstractTableResponse {
  className = VizResponseType.GroupedTableResponse;

  constructor(readonly headers: any[], readonly records: any[][], readonly minMaxValues: MinMaxData[], readonly total: number) {
    super(headers, records, minMaxValues, total);
  }

  static fromObject(obj: TableResponse): GroupTableResponse {
    const minMaxValues: MinMaxData[] = MinMaxData.getMinMaxValues(obj);
    return new GroupTableResponse(obj.headers, obj.records, minMaxValues, obj.total);
  }

  static empty(): GroupTableResponse {
    return new GroupTableResponse([], [], [], 0);
  }

  hasData(): boolean {
    return this.total != 0;
  }
}
