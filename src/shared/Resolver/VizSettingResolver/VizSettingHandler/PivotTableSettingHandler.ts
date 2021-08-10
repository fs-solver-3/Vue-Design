/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 12:05 PM
 */

import { WidgetType } from '@/shared';
import { PivotTableVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { VizSettingHandler } from '@/shared/Resolver';

export class PivotTableSettingHandler implements VizSettingHandler {
  toVizSetting(type: WidgetType, diSettingOptions: VizSettingData): VizSetting | undefined {
    return new PivotTableVizSetting(diSettingOptions);
  }
}
