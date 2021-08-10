/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 12:00 PM
 */

import { WidgetType } from '@/shared';
import { ParliamentVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { VizSettingHandler } from '@/shared/Resolver';

export class ParliamentVizSettingHandler implements VizSettingHandler {
  toVizSetting(chartType: WidgetType, diSettingOptions: VizSettingData): VizSetting | undefined {
    return new ParliamentVizSetting(diSettingOptions);
  }
}
