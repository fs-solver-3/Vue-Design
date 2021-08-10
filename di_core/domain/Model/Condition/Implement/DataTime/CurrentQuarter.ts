/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:23 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:18 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { ValueCondition } from '@core/domain/Model/Condition/ValueCondition';
import { getScalarFunction } from '@core/utils';
import { ConditionFamilyTypes, DateHistogramConditionTypes } from '@/shared';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

export class CurrentQuarter extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.CurrentQuarter;

  constructor(field: Field, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
  }

  static fromObject(obj: CurrentQuarter): CurrentQuarter {
    const field = Field.fromObject(obj.field);
    return new CurrentQuarter(field, getScalarFunction(obj.scalarFunction));
  }

  assignValue() {
    // do nothing
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.currentQuarter];
  }

  getValues(): string[] {
    return [];
  }
}
