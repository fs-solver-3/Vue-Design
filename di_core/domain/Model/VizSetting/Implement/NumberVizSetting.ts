/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:47 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, StyleSetting, TextSetting, TooltipSetting, VizSettingData, VizSettingType } from '@core/domain/Model';
import { MetricNumberMode } from '@/utils';

export interface NumberVizData extends VizSettingData {
  prefix?: TextSetting;
  postfix?: TextSetting;
  style?: StyleSetting;
  tooltip?: TooltipSetting;
  displayUnit?: MetricNumberMode;
  align?: AlignSetting;
}

export class NumberVizSetting extends VizSetting<NumberVizData> {
  static readonly DEFAULT_SETTING = {
    prefix: '',
    postfix: ''
  };
  chartFamilyType = ChartFamilyType.Number;
  className = VizSettingType.NumberSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: NumberVizSetting): NumberVizSetting {
    return new NumberVizSetting(obj.options);
  }
}
