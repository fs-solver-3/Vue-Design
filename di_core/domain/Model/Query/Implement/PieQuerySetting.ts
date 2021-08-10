/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import {
  Condition,
  Equal,
  Filterable,
  Function,
  getFiltersAndSorts,
  OrderBy,
  PieVizSetting,
  QuerySettingType,
  TableColumn,
  Zoomable
} from '@core/domain/Model';
import { QuerySetting } from '../QuerySetting';
import { Drilldownable, DrilldownData } from '@core/domain/Model/Query/Features/Drilldownable';
import { ZoomData } from '@/shared';
import { ConditionUtils } from '@core/utils';

export class PieQuerySetting extends QuerySetting<PieVizSetting> implements Filterable, Zoomable, Drilldownable {
  readonly className = QuerySettingType.Pie;

  constructor(public legend: TableColumn, public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  get zoomData(): ZoomData {
    return new ZoomData(this.legend.function);
  }

  static fromObject(obj: PieQuerySetting): PieQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const legend = TableColumn.fromObject(obj.legend);
    const value = TableColumn.fromObject(obj.value);
    return new PieQuerySetting(legend, value, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.legend.function, this.value.function];
  }

  getFilter(): TableColumn {
    return this.legend;
  }

  buildQueryDrilldown(drilldownData: DrilldownData): PieQuerySetting {
    const newLegend: TableColumn = this.legend.copyWith({
      name: drilldownData.name,
      fieldRelatedFunction: drilldownData.toField
    });
    const currentConditions: Condition[] = this.filters ?? [];
    const equal: Equal = ConditionUtils.buildEqualCondition(this.legend, drilldownData.value);
    const drilldownConditions: Condition[] = ConditionUtils.buildDrilldownConditions(currentConditions, equal);
    return new PieQuerySetting(newLegend, this.value, drilldownConditions, this.sorts, this.options);
  }

  getColumnWillDrilldown(): TableColumn {
    return this.legend;
  }

  buildNewZoomData(data: ZoomData, nextLvl: string): ZoomData {
    return data.createNewHorizontalField(nextLvl);
  }

  setZoomData(data: ZoomData): void {
    if (data.horizontalLevel?.scalarFunction) {
      this.legend.function.setScalarFunction(data.horizontalLevel.scalarFunction);
    }
  }
}
