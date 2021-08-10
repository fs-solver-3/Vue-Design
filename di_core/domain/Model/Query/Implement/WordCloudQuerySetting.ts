/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { Condition, Equal, Function, getFiltersAndSorts, OrderBy, QuerySettingType, TableColumn, WordCloudVizSetting, Zoomable } from '@core/domain/Model';
import { Drilldownable, DrilldownData } from '@core/domain/Model/Query/Features/Drilldownable';
import { ZoomData } from '@/shared';
import { ConditionUtils } from '@core/utils';

export class WordCloudQuerySetting extends QuerySetting<WordCloudVizSetting> implements Zoomable, Drilldownable {
  readonly className = QuerySettingType.WordCloud;

  constructor(public legend: TableColumn, public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  get zoomData(): ZoomData {
    return new ZoomData(this.legend.function);
  }

  static fromObject(obj: WordCloudQuerySetting): WordCloudQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const legend = TableColumn.fromObject(obj.legend);
    const value = TableColumn.fromObject(obj.value);
    return new WordCloudQuerySetting(legend, value, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.legend.function, this.value.function];
  }

  buildQueryDrilldown(drilldownData: DrilldownData): WordCloudQuerySetting {
    const newLegend: TableColumn = this.legend.copyWith({
      name: drilldownData.name,
      fieldRelatedFunction: drilldownData.toField
    });
    const currentConditions: Condition[] = this.filters ?? [];
    const equal: Equal = ConditionUtils.buildEqualCondition(this.legend, drilldownData.value);
    const drilldownConditions: Condition[] = ConditionUtils.buildDrilldownConditions(currentConditions, equal);
    return new WordCloudQuerySetting(newLegend, this.value, drilldownConditions, this.sorts, this.options);
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
