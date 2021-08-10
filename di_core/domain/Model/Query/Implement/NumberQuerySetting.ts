/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/3/20, 10:38 AM
 */

import { Condition, Function, getFiltersAndSorts, NumberVizSetting, OrderBy, QuerySettingType, TableColumn } from '@core/domain/Model';
import { QuerySetting } from '../QuerySetting';

export class NumberQuerySetting extends QuerySetting<NumberVizSetting> {
  readonly className = QuerySettingType.Number;

  constructor(public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  static fromObject(obj: NumberQuerySetting): NumberQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const value = TableColumn.fromObject(obj.value);
    return new NumberQuerySetting(value, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.value.function];
  }
}
