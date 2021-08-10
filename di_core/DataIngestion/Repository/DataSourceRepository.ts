import { DataSourceInfo } from '@core/DataIngestion/Domain/DataSource/DataSourceInfo';
import { InjectValue } from 'typescript-ioc';
import { DIKeys } from '@core/modules';
import { BaseClient } from '@core/services/base.service';
import { DataSource } from '@core/DataIngestion/Domain/Response/DataSource';
import { DIException, SourceId } from '@core/domain';
import { ListingResponse } from '@core/DataIngestion';
import { BaseResponse } from '@core/DataIngestion/Domain/Response/BaseResponse';
import { Log } from '@core/utils';

const headerScheduler = {
  'Content-Type': 'application/json',
  'access-token': 'job$cheduler@datainsider.co'
};

export abstract class DataSourceRepository {
  abstract testConnection(dataSourceInfo: DataSourceInfo): Promise<BaseResponse>;

  abstract create(dataSourceInfo: DataSourceInfo): Promise<DataSourceInfo>;

  abstract list(from: number, size: number): Promise<ListingResponse<DataSourceInfo>>;

  abstract delete(id: SourceId): Promise<boolean>;

  abstract update(id: SourceId, dataSourceInfo: DataSourceInfo): Promise<boolean>;

  abstract listDatabaseName(id: SourceId): Promise<string[]>;

  abstract listTableName(id: SourceId, dbName: string): Promise<string[]>;

  abstract listIncrementColumn(id: SourceId, dbName: string, tblName: string): Promise<string[]>;
}

export class DataSourceRepositoryImpl extends DataSourceRepository {
  @InjectValue(DIKeys.authClient)
  private readonly httpClient!: BaseClient;
  private apiPath = '/scheduler/source';

  testConnection(dataSourceInfo: DataSourceInfo): Promise<BaseResponse> {
    return this.httpClient.post(`worker/source/test`, dataSourceInfo.toDataSource(), void 0, headerScheduler);
  }

  create(dataSourceInfo: DataSourceInfo): Promise<DataSourceInfo> {
    return this.httpClient
      .post<DataSource>(`${this.apiPath}/create`, dataSourceInfo.toDataSource(), void 0, headerScheduler)
      .then(response => DataSourceInfo.fromDataSource(response));
  }

  list(from: number, size: number): Promise<ListingResponse<DataSourceInfo>> {
    return this.httpClient
      .post<any>(
        `${this.apiPath}/list`,
        {
          from: from,
          size: size
        },
        void 0,
        headerScheduler
      )
      .then(response => new ListingResponse<DataSourceInfo>(this.parseToDataSourceInfos(response.data), response.total))
      .catch(e => {
        Log.error('DataSourceRepository::list::exception::', e.message);
        throw new DIException(e.message);
      });
  }

  delete(id: SourceId): Promise<boolean> {
    return this.httpClient.delete(`${this.apiPath}/${id}`, void 0, void 0, headerScheduler);
  }

  update(id: SourceId, dataSourceInfo: DataSourceInfo): Promise<boolean> {
    return this.httpClient.put(`${this.apiPath}/${id}`, dataSourceInfo.toDataSource(), void 0, headerScheduler);
  }

  private parseToDataSourceInfos(dataSources: DataSource[]): DataSourceInfo[] {
    return dataSources.map((dataSource: DataSource) => DataSourceInfo.fromDataSource(dataSource));
  }

  listDatabaseName(id: number): Promise<string[]> {
    return this.httpClient.post(`worker/source/${id}/database`);
  }
  listTableName(id: number, dbName: string): Promise<string[]> {
    return this.httpClient.post(`worker/source/table`, { sourceId: id, databaseName: dbName });
  }

  listIncrementColumn(id: SourceId, dbName: string, tblName: string): Promise<string[]> {
    return this.httpClient.post(`worker/source/column`, { sourceId: id, databaseName: dbName, tableName: tblName });
  }
}
