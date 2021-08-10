import { ValueColorFormattingType } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/ValueColorFormattingType';

export interface ValueColorFormatting {
  enabled?: boolean;
  type?: ValueColorFormattingType;
  color?: string;
  value?: string;
}
