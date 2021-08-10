import { DataSource } from '@core/DataIngestion/Domain/Response/DataSource';
import { DataSourceInfo } from './DataSourceInfo';
import { DataSourceType } from '@core/DataIngestion/Domain/DataSource/DataSourceType';
import { SourceType } from '@core/DataIngestion/Domain/DataSource/SourceType';
import { JdbcSource } from '@core/DataIngestion/Domain/Response/JdbcSource';
import { SourceId } from '@core/domain';
import { ListUtils } from '@/utils';

export class MSSqlSourceInfo implements DataSourceInfo {
  className = SourceType.JdbcSource;
  sourceType = DataSourceType.MSSql;
  id: SourceId;
  displayName: string;
  host: string;
  port: string;
  databaseName: string;
  username: string;
  password: string;

  constructor(id: SourceId, displayName: string, host: string, port: string, databaseName: string, username: string, password: string) {
    this.id = id;
    this.displayName = displayName;
    this.host = host;
    this.port = port;
    this.databaseName = databaseName;
    this.username = username;
    this.password = password;
  }

  getDisplayName(): string {
    return this.displayName;
  }

  static fromJdbcSource(obj: JdbcSource): DataSourceInfo {
    const url = obj.jdbcUrl;
    const host = ListUtils.getLast(url.match('\\/\\/(.*/?):') as []) ?? '';
    const [port, databaseName] = url.split(host + ':')[1].split(';databaseName=') ?? ['', ''];
    const msSqlSourceInfo = new MSSqlSourceInfo(obj.id, obj.displayName, host, port, databaseName, obj.username, obj.password);
    return msSqlSourceInfo;
  }

  static fromObject(obj: any): MSSqlSourceInfo {
    return new MSSqlSourceInfo(
      obj.id ?? DataSourceInfo.DEFAULT_ID,
      obj.displayName ?? '',
      obj.host ?? '',
      obj.port ?? '',
      obj.databaseName ?? '',
      obj.username ?? '',
      obj.password ?? ''
    );
  }

  toDataSource(): DataSource {
    const jdbcUrl = `jdbc:sqlserver://${this.host}:${this.port};databaseName=${this.databaseName}`;
    const request = new JdbcSource(this.id, this.sourceType, this.displayName, jdbcUrl, this.username, this.password);
    return request;
  }
}
