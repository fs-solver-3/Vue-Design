import { DatabaseCreateRequest, CreateTableRequest } from '@core/domain/Request';
import { Inject } from 'typescript-ioc';
import { SchemaRepository } from '@core/schema/repository/SchemaRepository';
import { DatabaseInfo, DatabaseSchema, ColumnType, TableSchema } from '@core/domain/Model';
import { CreateColumnRequest } from '@core/schema/domain/CreateColumnRequest';
import { DetectExpressionTypeRequest } from '@core/schema/domain/DetectExpressionTypeRequest';
import { TableCreationFromQueryRequest } from '@core/domain/Request/Schema/TableCreationFromQueryRequest';
import { UpdateColumnRequest } from '@core/schema/domain/UpdateColumnRequest';
import { DeleteColumnRequest } from '@core/schema/domain/DeleteColumnRequest';

export abstract class SchemaService {
  abstract createDatabase(request: DatabaseCreateRequest): Promise<DatabaseInfo>;

  abstract dropDatabase(dbName: string): Promise<boolean>;

  abstract getDatabases(): Promise<DatabaseInfo[]>;

  abstract getDatabaseSchema(dbName: string): Promise<DatabaseSchema>;

  abstract createTable(request: CreateTableRequest): Promise<TableSchema>;

  abstract dropTable(dbName: string, tblName: string): Promise<boolean>;

  abstract createColumn(request: CreateColumnRequest): Promise<TableSchema>;

  abstract detectExpressionType(request: DetectExpressionTypeRequest): Promise<ColumnType>;

  abstract createTableFromQuery(request: TableCreationFromQueryRequest): Promise<TableSchema>;

  abstract updateColumn(request: UpdateColumnRequest): Promise<TableSchema>;

  abstract deleteCalculatedColumn(request: DeleteColumnRequest): Promise<TableSchema>;
}

export class SchemaServiceImpl extends SchemaService {
  constructor(@Inject private schemaRepository: SchemaRepository) {
    super();
  }

  createDatabase(request: DatabaseCreateRequest): Promise<DatabaseInfo> {
    return this.schemaRepository.createDatabase(request);
  }

  getDatabases(): Promise<DatabaseInfo[]> {
    return this.schemaRepository.getDatabases();
  }

  getDatabaseSchema(dbName: string): Promise<DatabaseSchema> {
    return this.schemaRepository.getDatabaseSchema(dbName);
  }

  dropDatabase(dbName: string): Promise<boolean> {
    return this.schemaRepository.dropDatabase(dbName);
  }

  createTable(request: CreateTableRequest): Promise<TableSchema> {
    return this.schemaRepository.createTable(request);
  }

  dropTable(dbName: string, tblName: string): Promise<boolean> {
    return this.schemaRepository.dropTable(dbName, tblName);
  }

  createColumn(request: CreateColumnRequest): Promise<TableSchema> {
    return this.schemaRepository.createColumn(request);
  }

  detectExpressionType(request: DetectExpressionTypeRequest): Promise<ColumnType> {
    return this.schemaRepository.detectExpressionType(request);
  }

  updateColumn(request: UpdateColumnRequest): Promise<TableSchema> {
    return this.schemaRepository.updateColumn(request);
  }

  deleteCalculatedColumn(request: DeleteColumnRequest): Promise<TableSchema> {
    return this.schemaRepository.deleteCalculatedColumn(request);
  }

  createTableFromQuery(request: TableCreationFromQueryRequest): Promise<TableSchema> {
    return this.schemaRepository.createTableFromQuery(request);
  }
}
