import { DataSource } from '@core/DataIngestion/Domain/Response/DataSource';
import { DataSourceInfo } from './DataSourceInfo';
import { DataSourceType } from '@core/DataIngestion/Domain/DataSource/DataSourceType';
import { SourceType } from '@core/DataIngestion/Domain/DataSource/SourceType';
import { JdbcSource } from '@core/DataIngestion/Domain/Response/JdbcSource';
import { SourceId } from '@core/domain';

export class BigQuerySourceInfo implements DataSourceInfo {
  className = SourceType.JdbcSource;
  sourceType = DataSourceType.BigQuery;
  id: SourceId;
  displayName: string;
  host: string;
  port: string;
  username: string;
  password: string;

  constructor(id: SourceId, displayName: string, host: string, port: string, username: string, password: string) {
    this.id = id;
    this.displayName = displayName;
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
  }

  static fromJdbcSource(obj: JdbcSource): DataSourceInfo {
    const bigQuerySourceInfo = new BigQuerySourceInfo(obj.id, obj.displayName, 'bigquery', 'bigquery', obj.username, obj.password);
    return bigQuerySourceInfo;
  }

  static fromObject(obj: any): BigQuerySourceInfo {
    return new BigQuerySourceInfo(
      obj.id ?? DataSourceInfo.DEFAULT_ID,
      obj.displayName ?? '',
      obj.host ?? '',
      obj.port ?? '',
      obj.username ?? '',
      obj.password ?? ''
    );
  }

  toDataSource(): DataSource {
    const request = new JdbcSource(this.id, this.sourceType, this.displayName, 'bigquery', 'bigquery', this.password);
    return request;
  }

  getDisplayName(): string {
    return this.displayName;
  }
}
