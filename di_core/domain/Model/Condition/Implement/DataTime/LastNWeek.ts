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

export class LastNWeek extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.LastNWeek;
  nWeek: string;

  constructor(field: Field, nWeek: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.nWeek = nWeek;
  }

  static fromObject(obj: LastNWeek): LastNWeek {
    const field = Field.fromObject(obj.field);
    const nWeek = obj.nWeek;
    return new LastNWeek(field, nWeek, getScalarFunction(obj.scalarFunction));
  }

  assignValue(nWeek: string) {
    this.nWeek = nWeek;
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.lastNWeeks];
  }

  getValues(): string[] {
    return [this.nWeek];
  }
}
