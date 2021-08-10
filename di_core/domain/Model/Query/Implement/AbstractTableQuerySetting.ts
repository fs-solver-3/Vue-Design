/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { Condition, FormatterSetting, OrderBy, QuerySettingType, TableColumn, TableVizSetting, VizSetting } from '@core/domain/Model';
import { SortDirection } from '@core/domain/Request';
import { Log } from '@core/utils';
import { Sortable } from '@core/domain/Model/Query/Features/Sortable';
import { Paginatable } from '@core/domain/Model/Query/Features/Paginatable';
import { DisplayTableType } from '@core/domain/Model/VizSetting/Implement/TableVizSetting';

export abstract class AbstractTableQuerySetting<T extends TableVizSetting = TableVizSetting> extends QuerySetting<T> implements Sortable, Paginatable {
  protected constructor(
    public readonly columns: TableColumn[],
    filters: Condition[] = [],
    sorts: OrderBy[] = [],
    options: Record<string, any> = {},
    public formatters: TableColumn[] = []
  ) {
    super(filters, sorts, options);
  }

  static isTableChartSetting(querySetting: any): querySetting is AbstractTableQuerySetting<any> {
    return (
      (querySetting.className == QuerySettingType.Table ||
        querySetting.className == QuerySettingType.GroupedTable ||
        querySetting.className == QuerySettingType.RawQuery) &&
      !!querySetting.changeDisplayType
    );
  }

  changeDisplayType(displayType: DisplayTableType): AbstractTableQuerySetting<T> {
    switch (displayType) {
      case DisplayTableType.Collapse:
        this.className = QuerySettingType.GroupedTable;
        break;
      case DisplayTableType.Normal:
        this.className = QuerySettingType.Table;
        break;
    }
    return this;
  }

  applySort(sortAsMap: Map<string, SortDirection>) {
    const newSorts: OrderBy[] = this.columns
      .filter(column => sortAsMap.has(column.name))
      .map(sortColumn => {
        const sortDirection = sortAsMap.get(sortColumn.name) ?? SortDirection.Asc;
        return new OrderBy(sortColumn.function, sortDirection);
      });
    Log.debug('newSort::', newSorts);
    this.sorts = newSorts;
  }

  getFrom(): number {
    return 0;
  }

  getSize(): number {
    return 20;
  }

  protected setValueBySetting(setting: VizSetting) {
    if (FormatterSetting.isFormatterSetting(setting)) {
      this.formatters = setting.getFormatters();
    }
  }
}
