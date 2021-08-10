import { Inject } from 'typescript-ioc';
import { DataSourceInfo } from '@core/DataIngestion/Domain/DataSource/DataSourceInfo';
import { DataSourceRepository } from '@core/DataIngestion/Repository/DataSourceRepository';
import { SourceId } from '@core/domain';
import { ListingResponse } from '@core/DataIngestion';

export abstract class DataSourceService {
  abstract testConnection(dataSourceInfo: DataSourceInfo): Promise<boolean>;
  abstract create(dataSourceInfo: DataSourceInfo): Promise<DataSourceInfo>;
  abstract list(from: number, size: number): Promise<ListingResponse<DataSourceInfo>>;
  abstract delete(id: SourceId): Promise<boolean>;
  abstract update(id: SourceId, dataSourceInfo: DataSourceInfo): Promise<boolean>;
  abstract listDatabaseName(id: SourceId): Promise<string[]>;

  abstract listTableName(id: SourceId, dbName: string): Promise<string[]>;
  abstract listIncrementColumns(id: SourceId, dbName: string, tblName: string): Promise<string[]>;
}

export class DataSourceServiceImpl extends DataSourceService {
  constructor(@Inject private dataSourceRepository: DataSourceRepository) {
    super();
  }

  testConnection(dataSourceInfo: DataSourceInfo): Promise<boolean> {
    return this.dataSourceRepository.testConnection(dataSourceInfo).then(response => response.success);
  }

  create(dataSourceInfo: DataSourceInfo): Promise<DataSourceInfo> {
    return this.dataSourceRepository.create(dataSourceInfo);
  }

  list(from: number, size: number): Promise<ListingResponse<DataSourceInfo>> {
    return this.dataSourceRepository.list(from, size);
  }

  delete(id: SourceId): Promise<boolean> {
    return this.dataSourceRepository.delete(id);
  }

  update(id: SourceId, dataSourceInfo: DataSourceInfo): Promise<boolean> {
    return this.dataSourceRepository.update(id, dataSourceInfo);
  }

  listDatabaseName(id: SourceId): Promise<string[]> {
    return this.dataSourceRepository.listDatabaseName(id);
  }

  listTableName(id: SourceId, dbName: string): Promise<string[]> {
    return this.dataSourceRepository.listTableName(id, dbName);
  }

  listIncrementColumns(id: SourceId, dbName: string, tblName: string): Promise<string[]> {
    return this.dataSourceRepository.listIncrementColumn(id, dbName, tblName);
  }
}
