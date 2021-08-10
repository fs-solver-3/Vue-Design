/*
 * @author: tvc12 - Thien Vi
 * @created: 7/20/21, 10:41 PM
 */

import { DrillThroughHandler } from '@/screens/DashboardDetail/components/DrillThrough/DrillThroguhHandler/DrillThroughHandler';
import { ChartInfo, Drilldownable, DynamicFilter } from '@core/domain';
import { MouseEventData } from '@chart/BaseChart';
import { SchemaUtils } from '@/utils';

export class DefaultDrillThroughHandler extends DrillThroughHandler {
  createFilter(metaData: ChartInfo, mouseEvent: MouseEventData<string>): DynamicFilter[] {
    const { setting } = metaData;
    if (Drilldownable.isDrilldownable(setting)) {
      const column = setting.getColumnWillDrilldown();
      const field = column.function.field;
      const filter = DynamicFilter.from(field, column.name, SchemaUtils.isNested(field.fieldName));
      this.configFilterValue(filter, mouseEvent);
      return [filter];
    } else {
      return [];
    }
  }
}
