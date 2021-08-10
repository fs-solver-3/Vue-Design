import { Column } from '@core/domain/Model/Column/Column';
import { ColumnType } from '@core/domain/Model';
import { Expression } from '@core/domain/Model/Column/Expression/Expression';

export class DoubleColumn extends Column {
  className = ColumnType.double;
  name!: string;
  displayName!: string;
  description?: string;
  defaultValue?: number;
  isNullable: boolean;
  defaultExpression?: Expression;

  constructor(name: string, displayName: string, isNullable: boolean, description?: string, defaultValue?: number, defaultExpression?: Expression) {
    super();
    this.name = name;
    this.displayName = displayName;
    this.description = description;
    this.defaultValue = defaultValue;
    this.isNullable = isNullable || false;
    this.defaultExpression = defaultExpression;
  }

  static fromObject(obj: DoubleColumn): DoubleColumn {
    const defaultExpression = obj.defaultExpression ? Expression.fromObject(obj.defaultExpression) : void 0;
    return new DoubleColumn(obj.name, obj.displayName, obj.isNullable, obj.description, obj.defaultValue, defaultExpression);
  }
}
