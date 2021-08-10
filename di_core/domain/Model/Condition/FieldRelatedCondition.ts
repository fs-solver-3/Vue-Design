import { Field, ScalarFunction } from '@core/domain/Model';
import { Condition } from './Condition';

export abstract class FieldRelatedCondition extends Condition {
  field!: Field;
  scalarFunction?: ScalarFunction;

  protected constructor(field: Field, scalarFunction?: ScalarFunction) {
    super();
    this.field = field;
    this.scalarFunction = scalarFunction;
  }

  static isFieldRelatedCondition(obj: any & FieldRelatedCondition): obj is FieldRelatedCondition {
    return !!obj.field;
  }

  setScalarFunction(scalarFunction: ScalarFunction): FieldRelatedCondition {
    this.scalarFunction = scalarFunction;
    return this;
  }
}
