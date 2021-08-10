/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 12:01 PM
 */

import { WidgetType } from '@/shared';
import { ParetoVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { merge } from 'lodash';
import { VizSettingHandler } from '@/shared/Resolver';

export class ParetoVizSettingHandler implements VizSettingHandler {
  toVizSetting(chartType: WidgetType, diSettingOptions: VizSettingData): VizSetting | undefined {
    let type: string = chartType;
    if (VizSetting.CHART_TYPE_CONVERT.has(type)) {
      type = VizSetting.CHART_TYPE_CONVERT.get(type) ?? type;
    }
    const newObject = merge(
      {
        chart: {
          type: type
        }
      },
      diSettingOptions
    );
    return new ParetoVizSetting(newObject);
  }
}
