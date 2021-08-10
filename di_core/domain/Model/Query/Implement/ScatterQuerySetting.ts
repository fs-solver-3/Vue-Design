/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/3/20, 10:38 AM
 */

import { Condition, Equal, Function, getFiltersAndSorts, OrderBy, QuerySettingType, ScatterVizSetting, TableColumn, Zoomable } from '@core/domain/Model';
import { QuerySetting } from '../QuerySetting';
import { Drilldownable, DrilldownData } from '@core/domain/Model/Query/Features/Drilldownable';
import { ZoomData } from '@/shared';
import { ConditionUtils } from '@core/utils';
import { Paginatable } from '@core/domain/Model/Query/Features/Paginatable';

export class ScatterQuerySetting extends QuerySetting<ScatterVizSetting> implements Zoomable, Drilldownable, Paginatable {
  private static readonly DEFAULT_NUM_DATA_POINT = 1000;
  readonly className = QuerySettingType.Scatter;

  constructor(
    public xAxis: TableColumn,
    public yAxis: TableColumn,
    public legend?: TableColumn,
    filters: Condition[] = [],
    sorts: OrderBy[] = [],
    options: Record<string, any> = {}
  ) {
    super(filters, sorts, options);
  }

  get zoomData(): ZoomData {
    return new ZoomData(this.xAxis.function);
  }

  static fromObject(obj: ScatterQuerySetting): ScatterQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const xAxis = TableColumn.fromObject(obj.xAxis);
    const yAxis = TableColumn.fromObject(obj.yAxis);
    const legend = obj.legend ? TableColumn.fromObject(obj.legend) : void 0;
    return new ScatterQuerySetting(xAxis, yAxis, legend, filters, sorts, obj.options);
  }

  getFrom(): number {
    return 0;
  }

  getSize(): number {
    const vizSetting: ScatterVizSetting | undefined = this.getVisualizationSetting();
    if (vizSetting && vizSetting.getNumDataPoint) {
      return vizSetting.getNumDataPoint() ?? ScatterQuerySetting.DEFAULT_NUM_DATA_POINT;
    } else {
      return ScatterQuerySetting.DEFAULT_NUM_DATA_POINT;
    }
  }

  getAllFunction(): Function[] {
    if (this.legend) {
      return [this.xAxis.function, this.yAxis.function, this.legend.function];
    } else {
      return [this.xAxis.function, this.yAxis.function];
    }
  }

  buildQueryDrilldown(drilldownData: DrilldownData): ScatterQuerySetting {
    const newXAxis: TableColumn = this.xAxis.copyWith({
      name: drilldownData.name,
      fieldRelatedFunction: drilldownData.toField
    });
    const currentConditions: Condition[] = this.filters ?? [];
    const equal: Equal = ConditionUtils.buildEqualCondition(this.xAxis, drilldownData.value);
    const drilldownConditions: Condition[] = ConditionUtils.buildDrilldownConditions(currentConditions, equal);
    return new ScatterQuerySetting(newXAxis, this.yAxis, this.legend, drilldownConditions, this.sorts, this.options);
  }

  getColumnWillDrilldown(): TableColumn {
    return this.xAxis;
  }

  buildNewZoomData(data: ZoomData, nextLvl: string): ZoomData {
    return data.createNewHorizontalField(nextLvl);
  }

  setZoomData(data: ZoomData): void {
    if (data.horizontalLevel?.scalarFunction) {
      this.xAxis.function.setScalarFunction(data.horizontalLevel.scalarFunction);
    }
  }
}
