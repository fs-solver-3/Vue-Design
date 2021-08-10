import { Column } from '@core/domain/Model/Column/Column';
import { ColumnType } from '@core/domain/Model';
import { Expression } from '@core/domain/Model/Column/Expression/Expression';

export class DateColumn extends Column {
  className = ColumnType.date;
  name!: string;
  displayName!: string;
  description?: string;
  inputFormats: string[] = [];
  defaultValue?: number;
  isNullable: boolean;
  defaultExpression?: Expression;

  constructor(
    name: string,
    displayName: string,
    inputFormats: string[],
    isNullable = false,
    description?: string,
    defaultValue?: number,
    defaultExpression?: Expression
  ) {
    super();
    this.name = name;
    this.displayName = displayName;
    this.inputFormats = inputFormats;
    this.description = description;
    this.defaultValue = defaultValue;
    this.isNullable = isNullable;
    this.defaultExpression = defaultExpression;
  }

  static fromObject(obj: DateColumn): DateColumn {
    const defaultExpression = obj.defaultExpression ? Expression.fromObject(obj.defaultExpression) : void 0;
    return new DateColumn(obj.name, obj.displayName, obj.inputFormats, obj.isNullable, obj.description, obj.defaultValue, defaultExpression);
  }
}

export class DateTimeColumn extends Column {
  className = ColumnType.datetime;
  name!: string;
  displayName!: string;
  inputFormats: string[] = [];
  inputAsTimestamp = false;
  description?: string;
  timezone?: string;
  defaultValue?: number;
  isNullable: boolean;
  defaultExpression?: Expression;

  constructor(
    name: string,
    displayName: string,
    inputFormats: string[],
    inputAsTimestamp: boolean,
    isNullable = false,
    description?: string,
    timezone?: string,
    defaultValue?: number,
    defaultExpression?: Expression
  ) {
    super();
    this.name = name;
    this.displayName = displayName;
    this.inputFormats = inputFormats;
    this.inputAsTimestamp = inputAsTimestamp;
    this.description = description;
    this.timezone = timezone;
    this.defaultValue = defaultValue;
    this.isNullable = isNullable;
    this.defaultExpression = defaultExpression;
  }

  static fromObject(obj: DateTimeColumn): DateTimeColumn {
    const defaultExpression = obj.defaultExpression ? Expression.fromObject(obj.defaultExpression) : void 0;
    return new DateTimeColumn(
      obj.name,
      obj.displayName,
      obj.inputFormats,
      obj.inputAsTimestamp,
      obj.isNullable,
      obj.description,
      obj.timezone,
      obj.defaultValue,
      defaultExpression
    );
  }
}

export class DateTime64Column extends Column {
  className = ColumnType.datetime64;
  name!: string;
  displayName!: string;
  description?: string;
  timezone?: string;
  inputAsTimestamp = false;
  inputFormats: string[] = [];
  defaultValue?: number;
  isNullable: boolean;
  defaultExpression?: Expression;

  constructor(
    name: string,
    displayName: string,
    inputFormats: string[],
    inputAsTimestamp: boolean,
    isNullable = false,
    description?: string,
    timezone?: string,
    defaultValue?: number,
    defaultExpression?: Expression
  ) {
    super();
    this.name = name;
    this.displayName = displayName;
    this.inputFormats = inputFormats;
    this.inputAsTimestamp = inputAsTimestamp;
    this.description = description;
    this.timezone = timezone;
    this.defaultValue = defaultValue;
    this.isNullable = isNullable;
    this.defaultExpression = defaultExpression;
  }

  static fromObject(obj: DateTime64Column): DateTime64Column {
    const defaultExpression = obj.defaultExpression ? Expression.fromObject(obj.defaultExpression) : void 0;
    return new DateTime64Column(
      obj.name,
      obj.displayName,
      obj.inputFormats,
      obj.inputAsTimestamp,
      obj.isNullable,
      obj.description,
      obj.timezone,
      obj.defaultValue,
      defaultExpression
    );
  }
}
