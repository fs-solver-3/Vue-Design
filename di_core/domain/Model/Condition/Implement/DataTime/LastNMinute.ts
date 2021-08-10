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

export class LastNMinute extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.LastNMinute;
  nMinute: string;

  constructor(field: Field, nMinute: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.nMinute = nMinute;
  }

  static fromObject(obj: LastNMinute): LastNMinute {
    const field = Field.fromObject(obj.field);
    const nMinute = obj.nMinute;
    return new LastNMinute(field, nMinute, getScalarFunction(obj.scalarFunction));
  }

  assignValue(nMinute: string) {
    this.nMinute = nMinute;
  }

  getValues(): string[] {
    return [this.nMinute];
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.lastNMinutes];
  }
}
