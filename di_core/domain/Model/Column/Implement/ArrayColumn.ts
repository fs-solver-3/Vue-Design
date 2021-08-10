import { Column } from '@core/domain/Model/Column/Column';
import { ColumnType } from '@core/domain/Model';
import { Expression } from '@core/domain/Model/Column/Expression/Expression';

export class ArrayColumn extends Column {
  defaultExpression?: Expression;
  className = ColumnType.array;
  displayName: string;
  name: string;
  isNullable: boolean;
  column: Column;
  description?: string;
  defaultValue?: Column[];

  constructor(
    displayName: string,
    name: string,
    isNullable: boolean,
    column: Column,
    description?: string,
    defaultValue?: Column[],
    defaultExpression?: Expression
  ) {
    super();
    this.displayName = displayName;
    this.name = name;
    this.description = description;
    this.isNullable = isNullable;
    this.column = column;
    this.defaultValue = defaultValue;
    this.defaultExpression = defaultExpression;
  }

  static fromObject(obj: ArrayColumn): ArrayColumn {
    const column = Column.fromObject(obj.column) as Column;
    const defaultExpression = obj.defaultExpression ? Expression.fromObject(obj.defaultExpression) : void 0;

    return new ArrayColumn(obj.displayName, obj.name, obj.isNullable, column, obj.description, obj.defaultValue, defaultExpression);
  }
}
