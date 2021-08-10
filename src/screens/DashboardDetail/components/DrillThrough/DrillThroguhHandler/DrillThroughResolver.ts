/*
 * @author: tvc12 - Thien Vi
 * @created: 7/20/21, 10:35 PM
 */

import { MouseEventData } from '@chart/BaseChart';
import { ChartInfo, DynamicFilter, QuerySettingType } from '@core/domain';
import { DrillThroughHandler } from '@/screens/DashboardDetail/components/DrillThrough/DrillThroguhHandler/DrillThroughHandler';
import { DefaultDrillThroughHandler } from '@/screens/DashboardDetail/components/DrillThrough/DrillThroguhHandler/DefaultDrillThroughHandler';
import { Log } from '@core/utils';
import { BubbleDrillThroughHandler } from '@/screens/DashboardDetail/components/DrillThrough/DrillThroguhHandler/BubbleDrillThroughHandler';
import { HeatmapDrillThroughHandler } from '@/screens/DashboardDetail/components/DrillThrough/DrillThroguhHandler/HeatmapDrillThroughHandler';
import { HistogramDrillThroughHandler } from '@/screens/DashboardDetail/components/DrillThrough/DrillThroguhHandler/HistogramDrillThroughHandler';

export class DrillThroughResolver {
  private readonly handlerAsMap: Map<QuerySettingType, DrillThroughHandler>;
  private readonly defaultHandler: DrillThroughHandler;

  constructor() {
    this.handlerAsMap = new Map<QuerySettingType, DrillThroughHandler>([
      [QuerySettingType.Bubble, new BubbleDrillThroughHandler()],
      [QuerySettingType.HeatMap, new HeatmapDrillThroughHandler()],
      [QuerySettingType.Histogram, new HistogramDrillThroughHandler()]
    ]);
    this.defaultHandler = new DefaultDrillThroughHandler();
  }

  createFilter(metaData: ChartInfo, mouseEvent: MouseEventData<string>): DynamicFilter[] {
    try {
      const handler = this.handlerAsMap.get(metaData.setting.className) ?? this.defaultHandler;
      return handler.createFilter(metaData, mouseEvent);
    } catch (ex) {
      Log.error('createFilter::ex', ex);
      return [];
    }
  }
}
