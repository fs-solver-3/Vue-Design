/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:48 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, VizSettingData, VizSettingType } from '@core/domain/Model';

export class DropdownVizSetting extends VizSetting {
  chartFamilyType = ChartFamilyType.Dropdown;
  className = VizSettingType.DropdownSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: any): DropdownVizSetting {
    return new DropdownVizSetting(obj.options);
  }
}
