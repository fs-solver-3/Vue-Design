/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:19 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:09 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

import { ConditionFamilyTypes, DateHistogramConditionTypes } from '@/shared';
import { getScalarFunction } from '@core/utils/function.utils';
import { ValueCondition } from '@core/domain/Model/Condition/ValueCondition';

export class CurrentMonth extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.CurrentMonth;

  constructor(field: Field, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
  }

  static fromObject(obj: CurrentMonth): CurrentMonth {
    const field = Field.fromObject(obj.field);
    return new CurrentMonth(field, getScalarFunction(obj.scalarFunction));
  }

  assignValue() {
    // do nothing
  }

  getValues(): string[] {
    return [];
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.currentMonth];
  }
}
