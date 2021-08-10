import { ConditionalFormattingType } from './ConditionalFormattingType';
import { ColorScale } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/ColorScale';
import { ApplyToType } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/ApplyToType';
import { ColorRules } from './ColorRules';
import { Field, FunctionType } from '@core/domain';

export interface ColorFormatting {
  enabled: boolean;
  formatType: ConditionalFormattingType;
  applyTo: ApplyToType;
  baseOnField?: Field;
  summarization?: FunctionType;
  scale?: ColorScale;
  rules?: ColorRules;
}
