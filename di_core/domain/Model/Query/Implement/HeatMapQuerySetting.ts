/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/3/20, 10:37 AM
 */

import { Condition, Function, getFiltersAndSorts, HeatMapVizSetting, OrderBy, QuerySettingType, TableColumn } from '@core/domain/Model';
import { QuerySetting } from '../QuerySetting';

export class HeatMapQuerySetting extends QuerySetting<HeatMapVizSetting> {
  readonly className = QuerySettingType.HeatMap;

  constructor(
    public xAxis: TableColumn,
    public yAxis: TableColumn,
    public value: TableColumn,
    filters: Condition[] = [],
    sorts: OrderBy[] = [],
    options: Record<string, any> = {}
  ) {
    super(filters, sorts, options);
  }

  static fromObject(obj: HeatMapQuerySetting): HeatMapQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const xAxis = TableColumn.fromObject(obj.xAxis);
    const yAxis = TableColumn.fromObject(obj.yAxis);
    const value = TableColumn.fromObject(obj.value);
    return new HeatMapQuerySetting(xAxis, yAxis, value, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.xAxis.function, this.yAxis.function, this.value.function];
  }

  static isHeatMapQuerySetting(obj: any): obj is HeatMapQuerySetting {
    return obj?.className === QuerySettingType.HeatMap;
  }
}
