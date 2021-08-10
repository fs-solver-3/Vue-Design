/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { QuerySetting } from '../QuerySetting';
import { Condition, Filterable, Function, getFiltersAndSorts, OrderBy, QuerySettingType, TabFilterVizSetting, TableColumn } from '@core/domain/Model';

export class TabFilterQuerySetting extends QuerySetting<TabFilterVizSetting> implements Filterable {
  readonly className = QuerySettingType.TabFilter;

  constructor(public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  static fromObject(obj: TabFilterQuerySetting): TabFilterQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const value = TableColumn.fromObject(obj.value);
    return new TabFilterQuerySetting(value, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.value.function];
  }

  getFilter(): TableColumn {
    return this.value;
  }
}
