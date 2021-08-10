/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:24 PM
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

export class LastNDay extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.LastNDay;
  nDay: string;

  constructor(field: Field, nDay: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.nDay = nDay;
  }

  static fromObject(obj: LastNDay): LastNDay {
    const field = Field.fromObject(obj.field);
    const nDay = obj.nDay;
    return new LastNDay(field, nDay, getScalarFunction(obj.scalarFunction));
  }

  assignValue(nDay: string) {
    this.nDay = nDay;
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.lastNDays];
  }

  getValues(): string[] {
    return [this.nDay];
  }
}
