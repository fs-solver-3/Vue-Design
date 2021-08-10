/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:23 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:17 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { ValueCondition } from '@core/domain/Model/Condition/ValueCondition';
import { getScalarFunction } from '@core/utils';
import { ConditionFamilyTypes, DateHistogramConditionTypes } from '@/shared';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

export class CurrentDay extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.CurrentDay;

  constructor(field: Field, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
  }

  static fromObject(obj: CurrentDay): CurrentDay {
    const field = Field.fromObject(obj.field);
    return new CurrentDay(field, getScalarFunction(obj.scalarFunction));
  }

  assignValue() {
    // do nothing
  }

  getValues(): string[] {
    return [];
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.currentDay];
  }
}
