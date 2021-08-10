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

export class LastNYear extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.LastNYear;
  nYear: string;

  constructor(field: Field, nYear: string, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.nYear = nYear;
  }

  static fromObject(obj: LastNYear): LastNYear {
    const field = Field.fromObject(obj.field);
    const nYear = obj.nYear;
    return new LastNYear(field, nYear, getScalarFunction(obj.scalarFunction));
  }

  getValues(): string[] {
    return [this.nYear];
  }

  getConditionTypes(): string[] {
    return [ConditionFamilyTypes.dateHistogram, DateHistogramConditionTypes.lastNYears];
  }

  assignValue(nYear: string) {
    this.nYear = nYear;
  }
}
