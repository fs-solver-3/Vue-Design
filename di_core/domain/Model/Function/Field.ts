/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:07 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 8:59 PM
 */

import { Equatable } from '@core/domain/Model/Equatable';
import { DataType } from '@core/schema/service/FieldFilter';
import { ChartUtils } from '@/utils';

export class Field implements Equatable {
  dbName: string;
  tblName: string;
  fieldName: string;
  fieldType: string;

  constructor(dbName: string, tblName: string, fieldName: string, fieldType: string) {
    this.dbName = dbName;
    this.tblName = tblName;
    this.fieldName = fieldName;
    this.fieldType = fieldType;
  }

  static fromObject(obj: Field): Field {
    return new Field(obj.dbName, obj.tblName, obj.fieldName, obj.fieldType);
  }

  equals(obj: any): boolean {
    if (obj) {
      return this.dbName === obj.dbName && this.tblName === obj.tblName && this.fieldName === obj.fieldName && this.fieldType === obj.fieldType;
    } else {
      return false;
    }
  }

  getDataType(): DataType {
    if (ChartUtils.isTextType(this.fieldType)) {
      return DataType.Text;
    }
    if (ChartUtils.isDateType(this.fieldType)) {
      return DataType.Date;
    }
    return DataType.Number;
  }

  static empty() {
    return new Field('', '', '', '');
  }
}
