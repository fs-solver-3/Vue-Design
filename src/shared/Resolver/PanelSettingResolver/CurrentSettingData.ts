/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 2:32 PM
 */

import { WidgetType } from '@/shared';
import { QuerySetting, VisualizationResponse, VizSetting } from '@core/domain';

export interface CurrentSettingData {
  widgetType: WidgetType;
  response: VisualizationResponse;
  setting: VizSetting;
  query: QuerySetting;
}
