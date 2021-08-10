/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:16 PM
 */

import { ConditionType, Field } from '@core/domain/Model';
import { Condition } from '@core/domain/Model/Condition/Condition';

export class NotEqualField extends Condition {
  className = ConditionType.NotEqualField;
  leftField: Field;
  rightField: Field;

  constructor(leftField: Field, rightField: Field) {
    super();
    this.leftField = leftField;
    this.rightField = rightField;
  }

  static fromObject(obj: NotEqualField): NotEqualField {
    const leftField = Field.fromObject(obj.leftField);
    const rightField = Field.fromObject(obj.rightField);
    return new NotEqualField(leftField, rightField);
  }

  assignValue(rightField: Field) {
    this.rightField = rightField;
  }
}
