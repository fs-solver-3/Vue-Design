/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { Condition, Function, OrderBy, QuerySettingType } from '@core/domain/Model';
import { Paginatable } from '@core/domain/Model/Query/Features/Paginatable';

export class RawQuerySetting extends QuerySetting implements Paginatable {
  readonly className = QuerySettingType.RawQuery;

  constructor(public sql: string, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  getAllFunction(): Function[] {
    return [];
  }

  getFrom(): number {
    return 0;
  }

  getSize(): number {
    return 20;
  }
}
