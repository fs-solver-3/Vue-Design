/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 12:05 PM
 */

import { WidgetType } from '@/shared';
import { TabFilterVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { VizSettingHandler } from '@/shared/Resolver';

export class TabFilterVizSettingHandler implements VizSettingHandler {
  toVizSetting(type: WidgetType, diSettingOptions: VizSettingData): VizSetting | undefined {
    return new TabFilterVizSetting(diSettingOptions);
  }
}
