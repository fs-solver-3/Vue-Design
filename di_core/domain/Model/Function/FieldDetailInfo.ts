import { Field } from '@core/domain/Model';

export class FieldDetailInfo {
  field: Field;
  displayName: string;
  name: string;
  isNested: boolean;
  isHidden: boolean;

  constructor(field: Field, name: string, displayName: string, isNested: boolean, isHidden?: boolean) {
    this.field = field;
    this.name = name;
    this.displayName = displayName;
    this.isNested = isNested;
    this.isHidden = isHidden || false;
  }

  static fromObject(obj: any): FieldDetailInfo {
    return new FieldDetailInfo(obj.field, obj.name, obj.displayName, obj.isNested, obj.isHidden);
  }
}
