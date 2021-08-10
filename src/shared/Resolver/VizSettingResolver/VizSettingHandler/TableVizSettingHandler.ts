/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 12:04 PM
 */

import { WidgetType } from '@/shared';
import { TableVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { VizSettingHandler } from '@/shared/Resolver';

export class TableVizSettingHandler implements VizSettingHandler {
  toVizSetting(chartType: WidgetType, diSettingOptions: VizSettingData): VizSetting | undefined {
    return new TableVizSetting(diSettingOptions);
  }
}
