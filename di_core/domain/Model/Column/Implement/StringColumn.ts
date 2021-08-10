/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:33 PM
 */

import { ColumnType } from '@core/domain/Model/Column/Implement/ColumnType';
import { Column } from '@core/domain/Model/Column/Column';
import { Expression } from '@core/domain/Model/Column/Expression/Expression';

export class StringColumn extends Column {
  className = ColumnType.string;
  name!: string;
  displayName!: string;
  description?: string;
  defaultValue?: string;
  isNullable: boolean;
  defaultExpression?: Expression;

  constructor(name: string, displayName: string, isNullable = false, description?: string, defaultValue?: string, defaultExpression?: Expression) {
    super();
    this.name = name;
    this.displayName = displayName;
    this.description = description;
    this.defaultValue = defaultValue;
    this.isNullable = isNullable;
    this.defaultExpression = defaultExpression;
  }

  static fromObject(obj: StringColumn): StringColumn {
    const defaultExpression = obj.defaultExpression ? Expression.fromObject(obj.defaultExpression) : void 0;

    return new StringColumn(obj.name, obj.displayName, obj.isNullable, obj.description, obj.defaultValue, defaultExpression);
  }
}
