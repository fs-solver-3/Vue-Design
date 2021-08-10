/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { Condition, Function, getFiltersAndSorts, OrderBy, QuerySettingType, TableColumn, TreeMapVizSetting } from '@core/domain/Model';
import { QuerySetting } from '../QuerySetting';

export class TreeMapQuerySetting extends QuerySetting<TreeMapVizSetting> {
  readonly className = QuerySettingType.TreeMap;

  constructor(public legends: TableColumn[], public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  static fromObject(obj: TreeMapQuerySetting): TreeMapQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const legends = obj.legends?.map(legend => TableColumn.fromObject(legend)) ?? [];
    const value = TableColumn.fromObject(obj.value);
    return new TreeMapQuerySetting(legends, value, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [...this.legends.map(legend => legend.function), this.value.function];
  }
}
