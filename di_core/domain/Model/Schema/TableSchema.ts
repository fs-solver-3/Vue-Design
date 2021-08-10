import { Column } from '@core/domain/Model';
import { DisplayName, FieldName } from '@core/schema/service/ExpressionParser';

export class TableSchema {
  name!: string;
  dbName!: string;
  organizationId!: number;
  displayName!: string;
  columns!: Column[];
  primaryKeys: string[] = [];
  orderBys: string[] = [];

  constructor(name: string, dbName: string, organizationId: number, displayName: string, columns: Column[], primaryKeys?: string[], orderBys?: string[]) {
    this.name = name;
    this.dbName = dbName;
    this.organizationId = organizationId;
    this.displayName = displayName;
    this.columns = columns;
    this.primaryKeys = primaryKeys || [];
    this.orderBys = orderBys = [];
  }

  static fromObject(obj: TableSchema): TableSchema {
    const columns = obj.columns?.map(col => Column.fromObject(col)).filter((item): item is Column => !!item);
    return new TableSchema(obj.name, obj.dbName, obj.organizationId, obj.displayName, columns);
  }

  toMapFieldNameAndDisplayName(): Map<FieldName, DisplayName> {
    const listNameAndDisplayName: [FieldName, DisplayName][] = this.columns.map(column => [column.name, column.displayName.trim()]);
    return new Map<FieldName, DisplayName>(listNameAndDisplayName);
  }

  /**
   *     tạo ra 1 map bao gồm:
   *     @Key tên rút gọn (Field Name)
   *     @Value name [FFieldName]
   */
  toMapDisplayNameAndFieldName(): Map<DisplayName, FieldName> {
    const displayNameAndFieldNames: [DisplayName, FieldName][] = this.columns.map((column: Column) => {
      const displayName: DisplayName = column.displayName.trim();
      const fieldName: FieldName = column.name;
      return [displayName, fieldName];
    });
    return new Map<DisplayName, FieldName>(displayNameAndFieldNames);
  }
}
