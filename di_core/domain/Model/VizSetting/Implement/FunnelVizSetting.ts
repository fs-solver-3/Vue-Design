/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:46 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, LegendSetting, VizSettingData, VizSettingType } from '@core/domain/Model';

export class FunnelVizSetting extends VizSetting {
  static readonly DEFAULT_SETTING = {
    plotOptions: {
      funnel: {
        borderWidth: 0,
        borderColor: 'black',
        showInLegend: true,
        dataLabels: {
          enabled: false
        }
      }
    }
  };
  readonly chartFamilyType = ChartFamilyType.Funnel;
  readonly className = VizSettingType.FunnelSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: FunnelVizSetting): FunnelVizSetting {
    return new FunnelVizSetting(obj.options);
  }
}
