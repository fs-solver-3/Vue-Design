/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 11:32 AM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/1/20, 7:38 PM
 */

import { WidgetType } from '@/shared';
import { VizSettingHandler } from './VizSettingHandler/VizSettingHandler';
import { VizSetting, VizSettingData } from '@core/domain/Model';
import { Log } from '@core/utils';

export class VizSettingResolver {
  constructor(private handlers: Map<string, VizSettingHandler>) {}

  toVizSetting(chartType: WidgetType, diSettingOptions: VizSettingData): VizSetting | undefined {
    const handler: VizSettingHandler | undefined = this.handlers.get(chartType);
    if (handler) {
      return handler.toVizSetting(chartType, diSettingOptions);
    } else {
      Log.debug("Can't build visualization setting");
      return void 0;
    }
  }
}
