/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { QuerySetting } from '../QuerySetting';
import { Condition, DropdownVizSetting, Filterable, Function, getFiltersAndSorts, OrderBy, QuerySettingType, TableColumn } from '@core/domain/Model';

export class DropdownQuerySetting extends QuerySetting<DropdownVizSetting> implements Filterable {
  readonly className = QuerySettingType.Dropdown;

  constructor(public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  static fromObject(obj: DropdownQuerySetting): DropdownQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const value = TableColumn.fromObject(obj.value);
    return new DropdownQuerySetting(value, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.value.function];
  }

  getFilter(): TableColumn {
    return this.value;
  }
}
