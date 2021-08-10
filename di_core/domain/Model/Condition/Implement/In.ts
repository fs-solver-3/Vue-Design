/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:17 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { ValueCondition } from '@core/domain/Model/Condition/ValueCondition';
import { getScalarFunction } from '@core/utils';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

export class In extends FieldRelatedCondition implements ValueCondition {
  className = ConditionType.IsIn;
  possibleValues: string[];

  constructor(field: Field, possibleValues: string[], scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
    this.possibleValues = possibleValues;
  }

  static fromObject(obj: In): In {
    const field = Field.fromObject(obj.field);
    const possibleValues: string[] = obj.possibleValues;
    return new In(field, possibleValues, getScalarFunction(obj.scalarFunction));
  }

  assignValue(possibleValues: string[]) {
    this.possibleValues = possibleValues;
  }

  getValues(): string[] {
    return this.possibleValues;
  }

  getConditionTypes(): string[] {
    // const filterType = ChartUtils.getDefaultFilterByColumnType(this.field.fieldType);
    return [];
  }
}
