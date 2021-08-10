/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:46 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';

export class PieVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    plotOptions: {
      pie: {
        borderWidth: 0,
        borderColor: 'black',
        dataLabels: {
          borderWidth: 0,
          textOutline: '0px contrast',
          useHTML: true,
          style: {
            border: '0px transparent',
            borderColor: 'none',
            textShadow: false,
            outline: 'none'
          }
        }
      }
    }
  };
  readonly chartFamilyType = ChartFamilyType.Pie;
  readonly className = VizSettingType.PieSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: PieVizSetting): PieVizSetting {
    return new PieVizSetting(obj.options);
  }
}
