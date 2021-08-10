/*
 * @author: tvc12 - Thien Vi
 * @created: 7/20/21, 10:41 PM
 */

import { DrillThroughHandler } from '@/screens/DashboardDetail/components/DrillThrough/DrillThroguhHandler/DrillThroughHandler';
import { ChartInfo, DynamicFilter } from '@core/domain';
import { MouseEventData } from '@chart/BaseChart';

export class BubbleDrillThroughHandler extends DrillThroughHandler {
  constructor() {
    super();
  }

  createFilter(metaData: ChartInfo, mouseEvent: MouseEventData<string>): DynamicFilter[] {
    return [];
    // const { setting } = metaData;
    // if (Drilldownable.isDrilldownable(setting)) {
    //   const column = setting.getColumnWillDrilldown();
    //   const field = column.function.field;
    //   const filter = DynamicFilter.from(field, column.name, SchemaUtils.isNested(field.fieldName));
    //   this.configValue(filter, mouseEvent);
    //   return filter;
    // }
  }
}
