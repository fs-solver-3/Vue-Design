/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/3/20, 10:38 AM
 */

import { Condition, Equal, Function, getFiltersAndSorts, OrderBy, ParetoVizSetting, QuerySettingType, TableColumn, Zoomable } from '@core/domain/Model';
import { QuerySetting } from '../QuerySetting';
import { Drilldownable, DrilldownData } from '@core/domain/Model/Query/Features/Drilldownable';
import { ZoomData } from '@/shared';
import { FilterUtils } from '@/utils';
import { ConditionUtils } from '@core/utils';

export class ParetoQuerySetting extends QuerySetting<ParetoVizSetting> implements Zoomable, Drilldownable {
  readonly className = QuerySettingType.Series;

  constructor(
    public xAxis: TableColumn,
    public yAxis: TableColumn[],
    public legend?: TableColumn,
    filters: Condition[] = [],
    sorts: OrderBy[] = [],
    options: Record<string, any> = {}
  ) {
    super(filters, sorts, options);
  }

  static fromObject(obj: ParetoQuerySetting): ParetoQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const xAxis = TableColumn.fromObject(obj.xAxis);
    const yAxis = obj.yAxis?.map(yAxis => TableColumn.fromObject(yAxis)) ?? [];
    const legend = obj.legend ? TableColumn.fromObject(obj.legend) : void 0;
    return new ParetoQuerySetting(xAxis, yAxis, legend, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    if (this.legend) {
      return [this.xAxis.function, ...this.yAxis.map(yAxis => yAxis.function), this.legend.function];
    } else {
      return [this.xAxis.function, ...this.yAxis.map(yAxis => yAxis.function)];
    }
  }

  buildNewZoomData(data: ZoomData, nextLvl: string): ZoomData {
    return data.createNewHorizontalField(nextLvl);
  }

  setZoomData(data: ZoomData): void {
    if (data.horizontalLevel?.scalarFunction) {
      this.xAxis.function.setScalarFunction(data.horizontalLevel.scalarFunction);
    }
  }

  get zoomData(): ZoomData {
    return new ZoomData(this.xAxis.function);
  }

  buildQueryDrilldown(drilldownData: DrilldownData): ParetoQuerySetting {
    const xAxis: TableColumn = this.xAxis.copyWith({
      fieldRelatedFunction: drilldownData.toField,
      name: drilldownData.name
    });
    const currentConditions: Condition[] = this.filters ?? [];
    const equal: Equal = ConditionUtils.buildEqualCondition(this.xAxis, drilldownData.value);
    const drilldownConditions: Condition[] = ConditionUtils.buildDrilldownConditions(currentConditions, equal);
    return new ParetoQuerySetting(xAxis, this.yAxis, this.legend, drilldownConditions, this.sorts, this.options);
  }

  getColumnWillDrilldown(): TableColumn {
    return this.xAxis;
  }
}
