import { Column } from '@core/domain/Model/Column/Column';
import { ColumnType } from '@core/domain/Model';
import { Expression } from '@core/domain/Model/Column/Expression/Expression';

export class BoolColumn extends Column {
  isNullable: boolean;
  className = ColumnType.bool;
  name!: string;
  displayName!: string;
  description?: string;
  defaultValue?: boolean;
  defaultExpression?: Expression;

  constructor(name: string, displayName: string, isNullable: boolean, description?: string, defaultValue?: boolean, defaultExpression?: Expression) {
    super();
    this.name = name;
    this.displayName = displayName;
    this.description = description;
    this.defaultValue = defaultValue;
    this.isNullable = isNullable;
    this.defaultExpression = defaultExpression;
  }

  static fromObject(obj: BoolColumn): BoolColumn {
    const defaultExpression = obj.defaultExpression ? Expression.fromObject(obj.defaultExpression) : void 0;
    return new BoolColumn(obj.name, obj.displayName, obj.isNullable, obj.description, obj.defaultValue, defaultExpression);
  }
}
