import { Condition, Equal, Function, getFiltersAndSorts, OrderBy, QuerySettingType, SpiderWebVizSetting, TableColumn, Zoomable } from '@core/domain/Model';
import { QuerySetting } from '../QuerySetting';
import { ZoomData } from '@/shared';
import { Drilldownable, DrilldownData } from '@core/domain/Model/Query/Features/Drilldownable';
import { ConditionUtils } from '@core/utils';

export class SpiderWebQuerySetting extends QuerySetting<SpiderWebVizSetting> implements Zoomable, Drilldownable {
  readonly className = QuerySettingType.SpiderWeb;

  constructor(public legend: TableColumn, public values: TableColumn[], filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  get zoomData(): ZoomData {
    return new ZoomData(this.legend.function);
  }

  static fromObject(obj: SpiderWebQuerySetting): SpiderWebQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const legend = TableColumn.fromObject(obj.legend);
    const values = obj.values?.map(value => TableColumn.fromObject(value)) ?? [];
    return new SpiderWebQuerySetting(legend, values, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.legend.function, ...this.values.map(yAxis => yAxis.function)];
  }

  buildNewZoomData(data: ZoomData, nextLvl: string): ZoomData {
    return data.createNewHorizontalField(nextLvl);
  }

  setZoomData(data: ZoomData): void {
    if (data.horizontalLevel?.scalarFunction) {
      this.legend.function.setScalarFunction(data.horizontalLevel.scalarFunction);
    }
  }

  buildQueryDrilldown(drilldownData: DrilldownData): SpiderWebQuerySetting {
    const legend: TableColumn = this.legend.copyWith({
      fieldRelatedFunction: drilldownData.toField,
      name: drilldownData.name
    });
    const currentConditions: Condition[] = this.filters ?? [];
    const equal: Equal = ConditionUtils.buildEqualCondition(this.legend, drilldownData.value);
    const drilldownConditions: Condition[] = ConditionUtils.buildDrilldownConditions(currentConditions, equal);
    return new SpiderWebQuerySetting(legend, this.values, drilldownConditions, this.sorts, this.options);
  }

  getColumnWillDrilldown(): TableColumn {
    return this.legend;
  }
}
