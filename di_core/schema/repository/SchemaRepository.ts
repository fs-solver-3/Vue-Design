import { DatabaseCreateRequest, CreateTableRequest } from '@core/domain/Request';
import { DatabaseInfo, DatabaseSchema, ColumnType, TableSchema } from '@core/domain/Model';
import { InjectValue } from 'typescript-ioc';
import { DIKeys } from '@core/modules/di';
import { BaseClient } from '@core/services/base.service';
import { CreateColumnRequest } from '@core/schema/domain/CreateColumnRequest';
import { DetectExpressionTypeRequest } from '@core/schema/domain/DetectExpressionTypeRequest';
import { UpdateColumnRequest } from '@core/schema/domain/UpdateColumnRequest';
import { DeleteColumnRequest } from '@core/schema/domain/DeleteColumnRequest';
import { TableCreationFromQueryRequest } from '@core/domain/Request/Schema/TableCreationFromQueryRequest';

abstract class SchemaRepository {
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

class SchemaRepositoryImpl extends SchemaRepository {
  @InjectValue(DIKeys.authClient)
  private httpClient!: BaseClient;
  private apiPath = '/databases';

  createDatabase(request: DatabaseCreateRequest): Promise<DatabaseInfo> {
    return this.httpClient
      .post<DatabaseInfo>(`${this.apiPath}`, request, undefined, {
        'DI-SERVICE-KEY': '123' // TODO: change this later
      })
      .then(obj => DatabaseInfo.fromObject(obj));
  }

  getDatabases(): Promise<DatabaseInfo[]> {
    return this.httpClient
      .get<DatabaseInfo[]>(`${this.apiPath}`, undefined, {
        'DI-SERVICE-KEY': '123'
      })
      .then(list => list.map(obj => DatabaseInfo.fromObject(obj)));
  }

  getDatabaseSchema(dbName: string): Promise<DatabaseSchema> {
    return this.httpClient
      .get<DatabaseSchema>(`${this.apiPath}/${dbName}`, undefined, {
        'DI-SERVICE-KEY': '123'
      })
      .then(obj => DatabaseSchema.fromObject(obj));
  }

  dropDatabase(dbName: string): Promise<boolean> {
    return this.httpClient.delete(`${this.apiPath}/${dbName}`, undefined, undefined, {
      'DI-SERVICE-KEY': '123'
    });
  }

  createTable(request: CreateTableRequest): Promise<TableSchema> {
    return this.httpClient
      .post<TableSchema>(`${this.apiPath}/${request.dbName}/tables`, request, undefined, {
        'DI-SERVICE-KEY': '123'
      })
      .then(obj => TableSchema.fromObject(obj));
  }

  dropTable(dbName: string, tblName: string): Promise<boolean> {
    return this.httpClient.delete(`${this.apiPath}/${dbName}/tables/${tblName}`, { adminSecretKey: 12345678, organizationId: 1 }, undefined, {
      'DI-SERVICE-KEY': '123'
    });
  }

  createColumn(request: CreateColumnRequest): Promise<TableSchema> {
    return this.httpClient
      .post(`${this.apiPath}/${request.dbName}/tables/${request.tblName}/column`, request)
      .then((resp: any) => TableSchema.fromObject(resp));
  }

  detectExpressionType(request: DetectExpressionTypeRequest): Promise<ColumnType> {
    return this.httpClient.post<ColumnType>(`${this.apiPath}/${request.dbName}/tables/${request.tblName}/expression`, request);
  }

  createTableFromQuery(request: TableCreationFromQueryRequest): Promise<TableSchema> {
    return this.httpClient.post(`${this.apiPath}/${request.dbName}/tables/from_query`, { ...request, adminSecretKey: 12345678 });
  }

  updateColumn(request: UpdateColumnRequest): Promise<TableSchema> {
    return this.httpClient.put(`${this.apiPath}/${request.dbName}/tables/${request.tblName}/column`, request);
  }

  deleteCalculatedColumn(request: DeleteColumnRequest): Promise<TableSchema> {
    return this.httpClient.delete(`${this.apiPath}/${request.dbName}/tables/${request.tblName}/columns/${request.columnName}`);
  }
}

export { SchemaRepository, SchemaRepositoryImpl };
