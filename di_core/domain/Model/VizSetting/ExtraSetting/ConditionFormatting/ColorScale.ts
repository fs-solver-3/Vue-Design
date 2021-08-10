import { ValueColorFormatting } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/ValueColorFormatting';
import { DefaultValueColorFormatting } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/DefaultValueColorFormatting';

export interface ColorScale {
  min?: ValueColorFormatting;
  center?: ValueColorFormatting;
  max?: ValueColorFormatting;
  default?: DefaultValueColorFormatting;
}
