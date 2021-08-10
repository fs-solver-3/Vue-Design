import { StyleSetting, TextSetting } from '@core/domain';
import { DashStyleValue } from 'highcharts';

export interface AxisSetting {
  visible?: boolean;
  title?: TextSetting;
  labels?: LabelsSetting;
  gridLineColor?: string;
  gridLineDashStyle?: DashStyleValue;
  gridLineInterpolation?: string;
  gridLineWidth?: number;
  min?: number;
  max?: number;
}
export interface LabelsSetting {
  style?: StyleSetting;
}
