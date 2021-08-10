import { StyleSetting } from '@core/domain';

export interface FieldFormatting {
  [key: string]: FieldFormatter;
}

export interface FieldFormatter {
  style?: StyleSetting;
  applyHeader?: boolean;
  applyTotals?: boolean;
  applyValues?: boolean;
  align?: AlignSetting;
  backgroundColor?: string;
}
