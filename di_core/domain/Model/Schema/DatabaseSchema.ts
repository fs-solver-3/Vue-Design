import { TableSchema } from '@core/domain/Model';
import { DatabaseInfo } from './DatabaseInfo';

export class DatabaseSchema extends DatabaseInfo {
  name!: string;
  organizationId!: number;
  displayName!: string;
  tables!: TableSchema[];

  constructor(name: string, organizationId: number, displayName: string, tables: TableSchema[]) {
    super(name, organizationId, displayName);
    this.tables = tables;
  }

  static fromObject(obj: DatabaseSchema): DatabaseSchema {
    const tables = obj.tables?.map(o => TableSchema.fromObject(o));
    return new DatabaseSchema(obj.name, obj.organizationId, obj.displayName, tables);
  }

  get keyword() {
    return [this.displayName, this.name, ...this.tables.map(t => t.displayName), ...this.tables.map(t => t.name)].join('|');
  }
}
