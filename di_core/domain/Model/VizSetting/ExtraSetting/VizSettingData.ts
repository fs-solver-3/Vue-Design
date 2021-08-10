/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:41 PM
 */

import { TextSetting, ThemeColor } from '@core/domain/Model';
import { MetricNumberMode } from '@/utils';

export interface VizSettingData {
  title?: TextSetting;
  textColor?: string;
  background?: string;
  subtitle?: TextSetting;
  html?: string;
  js?: string;
  css?: string;
  isCustomDisplay?: boolean;
  isEnableDrilldown?: boolean;
  isEnableZoom?: boolean;
  affectedByFilter?: boolean;
  enableIconZoom?: boolean;
  enableIconDrilldown?: boolean;
  themeColor?: ThemeColor;

  metricNumbers?: MetricNumberMode;
  numDataPoint?: number;

  [key: string]: any;
}
