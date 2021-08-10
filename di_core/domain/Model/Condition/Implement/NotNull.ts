/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:15 PM
 */

import { ConditionType, Field, ScalarFunction } from '@core/domain/Model';
import { getScalarFunction } from '@core/utils';
import { FieldRelatedCondition } from '@core/domain/Model/Condition/FieldRelatedCondition';

export class NotNull extends FieldRelatedCondition {
  className = ConditionType.NotNull;

  constructor(field: Field, scalarFunction?: ScalarFunction) {
    super(field, scalarFunction);
  }

  static fromObject(obj: NotNull): NotNull {
    const field = Field.fromObject(obj.field);
    return new NotNull(field, getScalarFunction(obj.scalarFunction));
  }
}
