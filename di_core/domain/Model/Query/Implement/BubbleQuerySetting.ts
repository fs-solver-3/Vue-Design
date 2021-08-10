/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/3/20, 10:38 AM
 */

import { BubbleVizSetting, Condition, Function, getFiltersAndSorts, OrderBy, QuerySettingType, TableColumn } from '@core/domain/Model';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { Paginatable } from '@core/domain/Model/Query/Features/Paginatable';

export class BubbleQuerySetting extends QuerySetting<BubbleVizSetting> implements Paginatable {
  private static readonly DEFAULT_NUM_DATA_POINT = 1000;
  readonly className = QuerySettingType.Bubble;

  constructor(
    public xAxis: TableColumn,
    public yAxis: TableColumn,
    public value: TableColumn,
    public legend?: TableColumn,
    filters: Condition[] = [],
    sorts: OrderBy[] = [],
    options: Record<string, any> = {}
  ) {
    super(filters, sorts, options);
  }

  static fromObject(obj: BubbleQuerySetting): BubbleQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const xAxis = TableColumn.fromObject(obj.xAxis);
    const yAxis = TableColumn.fromObject(obj.yAxis);
    const value = TableColumn.fromObject(obj.value);
    const legend = obj.legend ? TableColumn.fromObject(obj.legend) : void 0;
    return new BubbleQuerySetting(xAxis, yAxis, value, legend, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    if (this.legend) {
      return [this.xAxis.function, this.yAxis.function, this.value.function, this.legend.function];
    } else {
      return [this.xAxis.function, this.yAxis.function, this.value.function];
    }
  }

  getFrom(): number {
    return 0;
  }

  getSize(): number {
    const vizSetting: BubbleVizSetting | undefined = this.getVisualizationSetting();
    if (vizSetting && vizSetting.getNumDataPoint) {
      return vizSetting.getNumDataPoint() ?? BubbleQuerySetting.DEFAULT_NUM_DATA_POINT;
    } else {
      return BubbleQuerySetting.DEFAULT_NUM_DATA_POINT;
    }
  }
}
