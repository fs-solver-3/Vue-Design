import { WidgetType } from '@/shared';
import { SpiderWebVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { VizSettingHandler } from '@/shared/Resolver';
import { merge } from 'lodash';

export class SpiderWebVizSettingHandler implements VizSettingHandler {
  toVizSetting(type: WidgetType, diSettingOptions: VizSettingData): VizSetting | undefined {
    let widgetType: string = type;
    if (VizSetting.CHART_TYPE_CONVERT.has(type)) {
      widgetType = VizSetting.CHART_TYPE_CONVERT.get(type) ?? type;
    }
    const newObject = merge(
      {
        chart: {
          type: widgetType
        }
      },
      diSettingOptions
    );
    return new SpiderWebVizSetting(newObject);
  }
}
