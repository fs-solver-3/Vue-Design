/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/3/20, 10:33 AM
 */

import {
  BellCurve2VizSetting,
  BellCurveVizSetting,
  Condition,
  Function,
  getFiltersAndSorts,
  OrderBy,
  Paginatable,
  QuerySettingType,
  ScatterVizSetting,
  TableColumn,
  Zoomable
} from '@core/domain/Model';
import { QuerySetting } from '../QuerySetting';
import { ZoomData } from '@/shared';
import { Log } from '@core/utils';

export class BellCurveQuerySetting extends QuerySetting<BellCurveVizSetting> implements Zoomable {
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

  static fromObject(obj: BellCurveQuerySetting): BellCurveQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const xAxis = TableColumn.fromObject(obj.xAxis);
    const yAxis = TableColumn.fromObject(obj.yAxis);
    const legend = obj.legend ? TableColumn.fromObject(obj.legend) : void 0;
    return new BellCurveQuerySetting(xAxis, yAxis, legend, filters, sorts, obj.options);
  }

  //
  // buildQueryDrilldown(drilldownData: DrilldownData): QuerySetting {
  //   const newXAxis: TableColumn = this.xAxis.copyWith({
  //     name: drilldownData.name,
  //     fieldRelatedFunction: drilldownData.toField
  //   });
  //   const newFilters: Condition[] = this.filters ?? [];
  //   const equal: Equal = FilterUtils.buildEqualCondition(this.xAxis, drilldownData.value);
  //   this.filters.push(equal);
  //   return new BellCurveQueryChartSetting(newXAxis, this.yAxis, this.legend, newFilters, this.sorts, {});
  // }
  //
  // getColumnWillDrilldown(): TableColumn {
  //   return this.xAxis;
  // }

  getAllFunction(): Function[] {
    if (this.legend) {
      return [this.xAxis.function, this.yAxis.function, this.legend.function];
    } else {
      return [this.xAxis.function, this.yAxis.function];
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
}

export class BellCurve2QuerySetting extends QuerySetting<BellCurve2VizSetting> implements Zoomable, Paginatable {
  private static readonly DEFAULT_NUM_DATA_POINT = 1000;
  readonly className = QuerySettingType.BellCurve;

  constructor(public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  get zoomData(): ZoomData {
    return new ZoomData(this.value.function);
  }

  static fromObject(obj: BellCurve2QuerySetting): BellCurve2QuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const value = TableColumn.fromObject(obj.value);
    return new BellCurve2QuerySetting(value, filters, sorts, obj.options);
  }

  //
  // buildQueryDrilldown(drilldownData: DrilldownData): QuerySetting {
  //   const newXAxis: TableColumn = this.xAxis.copyWith({
  //     name: drilldownData.name,
  //     fieldRelatedFunction: drilldownData.toField
  //   });
  //   const newFilters: Condition[] = this.filters ?? [];
  //   const equal: Equal = FilterUtils.buildEqualCondition(this.xAxis, drilldownData.value);
  //   this.filters.push(equal);
  //   return new BellCurveQueryChartSetting(newXAxis, this.yAxis, this.legend, newFilters, this.sorts, {});
  // }
  //
  // getColumnWillDrilldown(): TableColumn {
  //   return this.xAxis;
  // }

  getAllFunction(): Function[] {
    return [this.value.function];
  }

  buildNewZoomData(data: ZoomData, nextLvl: string): ZoomData {
    return data.createNewHorizontalField(nextLvl);
  }

  setZoomData(data: ZoomData): void {
    if (data.horizontalLevel?.scalarFunction) {
      this.value.function.setScalarFunction(data.horizontalLevel.scalarFunction);
    }
  }
  getFrom(): number {
    return 0;
  }

  getSize(): number {
    const vizSetting: BellCurve2VizSetting | undefined = this.getVisualizationSetting();
    Log.debug('setting from get size::', vizSetting?.className);
    if (vizSetting && vizSetting.getNumDataPoint) {
      return vizSetting.getNumDataPoint() ?? BellCurve2QuerySetting.DEFAULT_NUM_DATA_POINT;
    } else {
      return BellCurve2QuerySetting.DEFAULT_NUM_DATA_POINT;
    }
  }

  static isBellCurve2QuerySetting(obj: any): obj is BellCurve2QuerySetting {
    return obj.className === QuerySettingType.BellCurve;
  }
}
