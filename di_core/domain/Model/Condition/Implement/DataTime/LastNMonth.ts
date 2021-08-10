/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:24 PM
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

export class LastNMonth extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.LastNMonth;
  nMonth: string;

  constructor(field: Field, nMonth: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.field = field;
    this.nMonth = nMonth;
  }

  static fromObject(obj: LastNMonth): LastNMonth {
    const field = Field.fromObject(obj.field);
    const nMonth = obj.nMonth;
    return new LastNMonth(field, nMonth, getScalarFunction(obj.scalarFunction));
  }

  assignValue(nMonth: string) {
    this.nMonth = nMonth;
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.lastNMonths];
  }

  getValues(): string[] {
    return [this.nMonth];
  }
}
