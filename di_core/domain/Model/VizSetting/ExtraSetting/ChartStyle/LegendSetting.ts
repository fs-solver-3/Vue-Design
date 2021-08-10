import { VerticalAlignValue } from 'highcharts';
import { StyleSetting, TextSetting } from '@core/domain';

export interface LegendSetting {
  enabled: boolean;
  verticalAlign?: VerticalAlignValue;
  align?: AlignSetting;
  layout?: LayoutValue;
  title?: TextSetting;
  itemStyle?: StyleSetting;
}

type LayoutValue = 'horizontal' | 'vertical';
