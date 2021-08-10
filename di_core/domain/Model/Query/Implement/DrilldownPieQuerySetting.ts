/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { QuerySetting } from '../QuerySetting';
import { Condition, DrilldownPieVizSetting, Function, getFiltersAndSorts, OrderBy, QuerySettingType, TableColumn } from '@core/domain/Model';

/**
 * @deprecated unused from v1.0.0
 */
export class DrilldownPieQueryChartSetting extends QuerySetting<DrilldownPieVizSetting> {
  readonly className = QuerySettingType.Drilldown;

  constructor(public legends: TableColumn[], public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  static fromObject(obj: DrilldownPieQueryChartSetting): DrilldownPieQueryChartSetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const legends = obj.legends?.map(legend => TableColumn.fromObject(legend)) ?? [];
    const value = TableColumn.fromObject(obj.value);
    return new DrilldownPieQueryChartSetting(legends, value, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [...this.legends.map(legend => legend.function), this.value.function];
  }
}
