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

export class LastNHour extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.LastNHour;
  nHour: string;

  constructor(field: Field, nHour: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.nHour = nHour;
  }

  static fromObject(obj: LastNHour): LastNHour {
    const field = Field.fromObject(obj.field);
    const nHour = obj.nHour;
    return new LastNHour(field, nHour, getScalarFunction(obj.scalarFunction));
  }

  assignValue(nHour: string) {
    this.nHour = nHour;
  }

  getValues(): string[] {
    return [this.nHour];
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.lastNHours];
  }
}
