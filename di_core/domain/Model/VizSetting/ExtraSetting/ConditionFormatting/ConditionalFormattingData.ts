import { ColorFormatting } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/ColorFormatting';
import { DataBarFormatting } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/DataBarFormatting';
import { IconFormatting } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/IconFormatting';

export interface ConditionalFormattingData {
  label?: string;
  backgroundColor?: ColorFormatting;
  color?: ColorFormatting;
  dataBar?: DataBarFormatting;
  icon?: IconFormatting;
}
