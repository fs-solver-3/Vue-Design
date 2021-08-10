/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:15 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { ValueCondition } from '@core/domain/Model/Condition/ValueCondition';
import { getScalarFunction } from '@core/utils';
import { ConditionFamilyTypes, NumberConditionTypes } from '@/shared';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

export class LessThanOrEqual extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.LessThanOrEqual;
  value: string;

  constructor(field: Field, value: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.value = value;
  }

  static fromObject(obj: LessThanOrEqual): LessThanOrEqual {
    const field = Field.fromObject(obj.field);
    const value = obj.value;
    return new LessThanOrEqual(field, value, getScalarFunction(obj.scalarFunction));
  }

  assignValue(value: string) {
    this.value = value;
  }

  getValues(): string[] {
    return [this.value];
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.number, NumberConditionTypes.lessThanOrEqual];
  }
}
