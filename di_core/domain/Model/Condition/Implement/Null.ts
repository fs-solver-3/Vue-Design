/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:14 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { getScalarFunction } from '@core/utils';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

export class Null extends FieldRelatedCondition {
  className = ConditionType.IsNull;

  constructor(field: Field, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
  }

  static fromObject(obj: Null): Null {
    const field = Field.fromObject(obj.field);
    const scalarFunction = getScalarFunction(obj.scalarFunction);
    return new Null(field, scalarFunction);
  }
}
