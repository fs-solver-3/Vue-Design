/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 12:04 PM
 */

import { WidgetType } from '@/shared';
import { NumberVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { merge } from 'lodash';
import { VizSettingHandler } from '@/shared/Resolver';

export class NumberVizSettingHandler implements VizSettingHandler {
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
    return new NumberVizSetting(newObject);
  }
}
