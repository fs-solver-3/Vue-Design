/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { Condition, Equal, Function, getFiltersAndSorts, OrderBy, QuerySettingType, StackedVizSetting, TableColumn, Zoomable } from '@core/domain/Model';
import { ZoomData } from '@/shared';
import { Drilldownable, DrilldownData } from '@core/domain/Model/Query/Features/Drilldownable';
import { ConditionUtils } from '@core/utils';

export class StackedQuerySetting extends QuerySetting<StackedVizSetting> implements Zoomable, Drilldownable {
  readonly className = QuerySettingType.Series;

  constructor(
    public xAxis: TableColumn,
    public yAxis: TableColumn[],
    public legend?: TableColumn,
    public breakdown?: TableColumn,
    filters: Condition[] = [],
    sorts: OrderBy[] = [],
    options: Record<string, any> = {}
  ) {
    super(filters, sorts, options);
  }

  get zoomData(): ZoomData {
    return new ZoomData(this.xAxis.function);
  }

  static fromObject(obj: StackedQuerySetting): StackedQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const xAxis = TableColumn.fromObject(obj.xAxis);
    const yAxis = obj.yAxis?.map(yAxis => TableColumn.fromObject(yAxis)) ?? [];
    const legend = obj.legend ? TableColumn.fromObject(obj.legend) : void 0;
    const breakdown = obj.breakdown ? TableColumn.fromObject(obj.breakdown) : void 0;
    return new StackedQuerySetting(xAxis, yAxis, legend, breakdown, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    const allFunctions = [this.xAxis.function, ...this.yAxis.map(yAxis => yAxis.function)];
    if (this.legend) {
      allFunctions.push(this.legend.function);
    }
    if (this.breakdown) {
      allFunctions.push(this.breakdown.function);
    }
    return allFunctions;
  }

  buildNewZoomData(data: ZoomData, nextLvl: string): ZoomData {
    return data.createNewHorizontalField(nextLvl);
  }

  setZoomData(data: ZoomData): void {
    if (data.horizontalLevel?.scalarFunction) {
      this.xAxis.function.setScalarFunction(data.horizontalLevel.scalarFunction);
    }
  }

  buildQueryDrilldown(drilldownData: DrilldownData): StackedQuerySetting {
    const xAxis: TableColumn = this.xAxis.copyWith({
      fieldRelatedFunction: drilldownData.toField,
      name: drilldownData.name
    });
    const currentConditions: Condition[] = this.filters ?? [];
    const equal: Equal = ConditionUtils.buildEqualCondition(this.xAxis, drilldownData.value);
    const drilldownConditions: Condition[] = ConditionUtils.buildDrilldownConditions(currentConditions, equal);
    return new StackedQuerySetting(xAxis, this.yAxis, this.legend, this.breakdown, drilldownConditions, this.sorts, this.options);
  }

  getColumnWillDrilldown(): TableColumn {
    return this.xAxis;
  }
}
