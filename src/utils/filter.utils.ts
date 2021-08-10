import { And, ChartInfo, Condition, ConditionType, Equal, FieldRelatedCondition, Filterable, Or, TableColumn } from '@core/domain/Model';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { ListUtils } from '@/utils/list.utils';

export abstract class FilterUtils {
  static getFilterColumn(querySetting: QuerySetting): TableColumn | undefined {
    if (Filterable.isFilterable(querySetting)) {
      return querySetting.getFilter();
    } else {
      return void 0;
    }
  }

  static getFilterValue(condition: FieldRelatedCondition | undefined): string | undefined {
    switch (condition?.className) {
      case ConditionType.Equal:
        return (condition as Equal).value;
      default:
        return void 0;
    }
  }

  static isFilter(filter: ChartInfo): boolean {
    return !!this.getFilterColumn(filter.setting);
  }
}
