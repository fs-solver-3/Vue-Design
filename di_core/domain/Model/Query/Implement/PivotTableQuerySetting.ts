/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import {
  Condition,
  FormatterSetting,
  Function,
  getFiltersAndSorts,
  OrderBy,
  PivotTableVizSetting,
  QuerySettingType,
  TableColumn,
  VizSetting
} from '@core/domain/Model';
import { SortDirection } from '@core/domain/Request';
import { Sortable } from '@core/domain/Model/Query/Features/Sortable';
import { Paginatable } from '@core/domain/Model/Query/Features/Paginatable';
import { cloneDeep } from 'lodash';
import { ListUtils } from '@/utils';

export class PivotTableQuerySetting extends QuerySetting<PivotTableVizSetting> implements Sortable, Paginatable {
  readonly className = QuerySettingType.PivotTable;

  constructor(
    public columns: TableColumn[],
    public rows: TableColumn[],
    public values: TableColumn[],
    filters: Condition[],
    sorts: OrderBy[],
    options: Record<string, any>,
    public formatters: TableColumn[] = []
  ) {
    super(filters, sorts, options);
  }

  static fromObject(obj: any): PivotTableQuerySetting {
    const columns = obj.columns.map((column: any) => TableColumn.fromObject(column));
    const rows = obj.rows.map((column: any) => TableColumn.fromObject(column));
    const values = obj.values.map((column: any) => TableColumn.fromObject(column));
    const formatters = obj.formatters?.map((column: any) => TableColumn.fromObject(column)) ?? [];
    const [filters, sorts] = getFiltersAndSorts(obj);

    return new PivotTableQuerySetting(columns, rows, values, filters, sorts, obj.options, formatters);
  }

  static isPivotChartSetting(setting: any): setting is PivotTableQuerySetting {
    return setting.className == QuerySettingType.PivotTable;
  }

  getAllFunction(): Function[] {
    const columnFunctions = this.columns.map(col => col.function);
    const rowFunctions = this.rows.map(row => row.function);
    const valueFunctions = this.values.map(value => value.function);
    return [...columnFunctions, ...rowFunctions, ...valueFunctions];
  }

  applySort(sortAsMap: Map<string, SortDirection>): void {
    const newSorts: OrderBy[] = [...this.columns, ...this.rows]
      .filter(column => sortAsMap.has(column.name))
      .map(sortColumn => {
        const sortDirection = sortAsMap.get(sortColumn.name) ?? SortDirection.Asc;
        return new OrderBy(sortColumn.function, sortDirection);
      });
    this.sorts = newSorts;
  }

  isPivotTableQuerySetting(obj: any): obj is PivotTableQuerySetting {
    return obj.className === QuerySettingType.PivotTable;
  }

  getFrom(): number {
    return 0;
  }

  getSize(): number {
    return 20;
  }

  getCurrentQuery() {
    const query = cloneDeep(this);
    // use only one row when columns existed
    if (ListUtils.isNotEmpty(query.columns)) {
      query.rows = query.rows.slice(0, 1);
    }
    return query;
  }

  canDrilldown(): boolean {
    return ListUtils.isNotEmpty(this.columns) && ListUtils.isNotEmpty(this.rows);
  }

  getDrilldownLevel(): number {
    return this.rows.length;
  }

  setFormatters(formatters: TableColumn[]): void {
    this.formatters = formatters;
  }

  protected setValueBySetting(setting: VizSetting) {
    if (FormatterSetting.isFormatterSetting(setting)) {
      this.formatters = setting.getFormatters();
    }
  }
}
