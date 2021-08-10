/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:15 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { ValueCondition } from '@core/domain/Model/Condition/ValueCondition';
import { getScalarFunction } from '@core/utils';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

export class LessThan extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.LessThan;
  value: string;

  constructor(field: Field, value: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.value = value;
  }

  static fromObject(obj: LessThan): LessThan {
    const field = Field.fromObject(obj.field);
    const value = obj.value;
    return new LessThan(field, value, getScalarFunction(obj.scalarFunction));
  }

  getValues(): string[] {
    return [this.value];
  }
}
