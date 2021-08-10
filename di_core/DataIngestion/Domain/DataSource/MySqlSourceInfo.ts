import { DataSource } from '@core/DataIngestion/Domain/Response/DataSource';
import { DataSourceInfo } from './DataSourceInfo';
import { DataSourceType } from '@core/DataIngestion/Domain/DataSource/DataSourceType';
import { SourceType } from '@core/DataIngestion/Domain/DataSource/SourceType';
import { JdbcSource } from '@core/DataIngestion/Domain/Response/JdbcSource';
import { SourceId } from '@core/domain';

export class MySqlSourceInfo implements DataSourceInfo {
  className = SourceType.JdbcSource;
  sourceType = DataSourceType.MySql;
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
    const url = obj.jdbcUrl;
    const [host, port] = url.split('//')[1].split(':');
    const mySqlSourceInfo = new MySqlSourceInfo(obj.id, obj.displayName, host, port, obj.username, obj.password);
    return mySqlSourceInfo;
  }

  static fromObject(obj: any): MySqlSourceInfo {
    return new MySqlSourceInfo(
      obj.id ?? DataSourceInfo.DEFAULT_ID,
      obj.displayName ?? '',
      obj.host ?? '',
      obj.port ?? '',
      obj.username ?? '',
      obj.password ?? ''
    );
  }

  toDataSource(): DataSource {
    const jdbcUrl = `jdbc:mysql://${this.host}:${this.port}`;
    const request = new JdbcSource(this.id, this.sourceType, this.displayName, jdbcUrl, this.username, this.password);
    return request;
  }

  getDisplayName(): string {
    return this.displayName;
  }
}
