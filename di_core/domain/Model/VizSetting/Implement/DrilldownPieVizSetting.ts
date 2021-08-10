/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:47 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, VizSettingData, VizSettingType } from '@core/domain/Model';

/**
 * @deprecated from v1.0.0
 */
export class DrilldownPieVizSetting extends VizSetting {
  static readonly DEFAULT_SETTING = {
    plotOptions: {
      pie: {
        borderWidth: 0,
        borderColor: 'black',
        dataLabels: {
          useHTML: true,
          style: {
            border: '0px',
            borderColor: 'none',
            textShadow: false
          }
        }
      }
    }
  };
  chartFamilyType = ChartFamilyType.DrilldownPie;
  className = VizSettingType.DrilldownPieSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: DrilldownPieVizSetting): DrilldownPieVizSetting {
    return new DrilldownPieVizSetting(obj.options);
  }
}
