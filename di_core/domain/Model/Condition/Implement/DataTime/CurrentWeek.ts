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

export class CurrentWeek extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.CurrentWeek;

  constructor(field: Field, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
  }

  static fromObject(obj: CurrentWeek): CurrentWeek {
    const field = Field.fromObject(obj.field);
    return new CurrentWeek(field, getScalarFunction(obj.scalarFunction));
  }

  assignValue() {
    // do nothing
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.currentWeek];
  }

  getValues(): string[] {
    return [];
  }
}
