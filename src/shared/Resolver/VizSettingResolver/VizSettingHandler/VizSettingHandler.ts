/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 11:55 AM
 */

import { WidgetType } from '@/shared';
import { VizSetting, VizSettingData } from '@core/domain/Model';

export abstract class VizSettingHandler {
  abstract toVizSetting(type: WidgetType, diSettingOptions: VizSettingData): VizSetting | undefined;
}
