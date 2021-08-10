/*
 * @author: tvc12 - Thien Vi
 * @created: 12/10/20, 10:25 AM
 */

import { Condition, Function, getFiltersAndSorts, OrderBy, QuerySettingType, TableColumn, TableVizSetting } from '@core/domain/Model';
import { AbstractTableQuerySetting } from './AbstractTableQuerySetting';

export class GroupedTableQuerySetting extends AbstractTableQuerySetting<TableVizSetting> {
  readonly className = QuerySettingType.GroupedTable;

  constructor(
    readonly columns: TableColumn[],
    filters: Condition[] = [],
    sorts: OrderBy[] = [],
    options: Record<string, any> = {},
    readonly formatters: TableColumn[] = []
  ) {
    super(columns, filters, sorts, options, formatters);
  }

  static fromObject(obj: any): GroupedTableQuerySetting {
    const columns = obj.columns?.map((col: any) => TableColumn.fromObject(col)) ?? [];
    const formatters = obj.formatters?.map((col: any) => TableColumn.fromObject(col)) ?? [];
    const [filters, sorts] = getFiltersAndSorts(obj);
    return new GroupedTableQuerySetting(columns, filters, sorts, obj.options, formatters);
  }

  getAllFunction(): Function[] {
    return this.columns.map(col => col.function);
  }
}
