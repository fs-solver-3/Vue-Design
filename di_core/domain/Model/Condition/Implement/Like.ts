/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:16 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { ValueCondition } from '@core/domain/Model/Condition/ValueCondition';
import { getScalarFunction } from '@core/utils';
import { ConditionFamilyTypes, StringConditionTypes } from '@/shared';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

export class Like extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.Like;
  value: string;

  constructor(field: Field, value: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.value = value;
  }

  static fromObject(obj: Like): Like {
    const field = Field.fromObject(obj.field);
    const value = obj.value;
    return new Like(field, value, getScalarFunction(obj.scalarFunction));
  }

  assignValue(value: string) {
    this.value = value;
  }

  getValues(): string[] {
    return [this.value];
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.string, StringConditionTypes.like];
  }
}
