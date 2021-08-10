/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 11:04 AM
 */

import { Condition, Drilldownable, DrilldownData, Equal, Function, getFiltersAndSorts, OrderBy, QuerySettingType, TableColumn } from '@core/domain/Model';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { ParliamentVizSetting } from '@core/domain/Model/VizSetting/Implement/ParliamentVizSetting';
import { ConditionUtils } from '@core/utils';

export class ParliamentQuerySetting extends QuerySetting<ParliamentVizSetting> implements Drilldownable {
  readonly className = QuerySettingType.Parliament;

  constructor(public legend: TableColumn, public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  static fromObject(obj: ParliamentQuerySetting & any): ParliamentQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const legend = TableColumn.fromObject(obj.legend);
    const value = TableColumn.fromObject(obj.value);
    return new ParliamentQuerySetting(legend, value, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.legend.function, this.value.function];
  }

  buildQueryDrilldown(drilldownData: DrilldownData): QuerySetting {
    const newLegend: TableColumn = this.legend.copyWith({
      name: drilldownData.name,
      fieldRelatedFunction: drilldownData.toField
    });
    const currentConditions: Condition[] = this.filters ?? [];
    const equal: Equal = ConditionUtils.buildEqualCondition(this.legend, drilldownData.value);
    const drilldownConditions: Condition[] = ConditionUtils.buildDrilldownConditions(currentConditions, equal);
    return new ParliamentQuerySetting(newLegend, this.value, drilldownConditions, this.sorts, this.options);
  }

  getColumnWillDrilldown(): TableColumn {
    return this.legend;
  }
}
