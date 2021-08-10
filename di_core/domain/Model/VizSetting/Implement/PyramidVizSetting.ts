/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:46 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, VizSettingData, VizSettingType } from '@core/domain/Model';

export class PyramidVizSetting extends VizSetting {
  static readonly DEFAULT_SETTING = {
    plotOptions: {
      pyramid: {
        borderWidth: 0,
        borderColor: 'black',
        showInLegend: true,
        dataLabels: {
          enabled: false
        }
      }
    }
  };
  readonly chartFamilyType = ChartFamilyType.Pyramid;
  readonly className = VizSettingType.PyramidSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: PyramidVizSetting): PyramidVizSetting {
    return new PyramidVizSetting(obj.options);
  }
}
