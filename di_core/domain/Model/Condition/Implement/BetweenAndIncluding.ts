/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:16 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { ValueCondition } from '@core/domain/Model/Condition/ValueCondition';
import { getScalarFunction } from '@core/utils';
import { ConditionFamilyTypes, DateHistogramConditionTypes } from '@/shared';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

export class BetweenAndIncluding extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.BetweenAndIncluding;
  min: string;
  max: string;

  constructor(field: Field, min: string, max: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.min = min;
    this.max = max;
  }

  static fromObject(obj: BetweenAndIncluding): BetweenAndIncluding {
    const field = Field.fromObject(obj.field);
    const min = obj.min;
    const max = obj.max;
    return new BetweenAndIncluding(field, min, max, getScalarFunction(obj.scalarFunction));
  }

  assignValue(min: string, max: string) {
    this.min = min;
    this.max = max;
  }

  getValues(): string[] {
    return [this.min, this.max];
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.betweenAndIncluding];
  }
}
