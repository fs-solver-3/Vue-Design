import { RuleType } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/RuleType';

export interface Rule {
  id: string;
  firstCondition: RuleCondition;
  secondCondition?: RuleCondition;
  value: string;
}

export interface RuleCondition {
  conditionType: RuleType;
  value: string;
  valueType: ValueType;
}

export enum ValueType {
  Number = 'number',
  Percentage = 'percentage'
}
