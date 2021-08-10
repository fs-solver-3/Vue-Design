/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:48 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, VizSettingData, VizSettingType } from '@core/domain/Model';
import { Direction, TabFilterDisplay } from '@/shared';
export interface TabVizData extends VizSettingData {
  displayAs?: TabFilterDisplay;
  direction?: Direction;
  activeColor?: string;
  deactivateColor?: string;
}
export class TabFilterVizSetting extends VizSetting<TabVizData> {
  chartFamilyType = ChartFamilyType.TabFilter;
  className = VizSettingType.TabFilterSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: any): TabFilterVizSetting {
    return new TabFilterVizSetting(obj.options);
  }
}
