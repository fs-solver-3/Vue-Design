import { FieldRelatedCondition } from '@core/domain/Model';

export abstract class ValueCondition {
  static isValueCondition(condition: ValueCondition | FieldRelatedCondition): condition is ValueCondition {
    return (condition as ValueCondition)?.getValues() != undefined;
  }

  abstract getValues(): string[];
}
