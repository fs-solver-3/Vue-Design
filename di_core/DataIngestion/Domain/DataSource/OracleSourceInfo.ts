import { DataSource } from '@core/DataIngestion/Domain/Response/DataSource';
import { DataSourceInfo } from './DataSourceInfo';
import { DataSourceType } from '@core/DataIngestion/Domain/DataSource/DataSourceType';
import { SourceType } from '@core/DataIngestion/Domain/DataSource/SourceType';
import { JdbcSource } from '@core/DataIngestion/Domain/Response/JdbcSource';
import { SourceId } from '@core/domain';

export class OracleSourceInfo implements DataSourceInfo {
  className = SourceType.JdbcSource;
  sourceType = DataSourceType.Oracle;
  id: SourceId;
  displayName: string;
  host: string;
  port: string;
  serviceName: string;
  username: string;
  password: string;

  constructor(id: SourceId, displayName: string, host: string, port: string, serviceName: string, username: string, password: string) {
    this.id = id;
    this.displayName = displayName;
    this.host = host;
    this.port = port;
    this.serviceName = serviceName;
    this.username = username;
    this.password = password;
  }

  static fromJdbcSource(obj: JdbcSource): DataSourceInfo {
    const url = obj.jdbcUrl;
    const [host, tail] = url.split('//')[1].split(':');
    const [port, serviceName] = tail.split('/');
    const oracleSourceInfo = new OracleSourceInfo(obj.id, obj.displayName, host, port, serviceName, obj.username, obj.password);
    return oracleSourceInfo;
  }

  static fromObject(obj: any): OracleSourceInfo {
    return new OracleSourceInfo(
      obj.id ?? DataSourceInfo.DEFAULT_ID,
      obj.displayName ?? '',
      obj.host ?? '',
      obj.port ?? '',
      obj.serviceName ?? '',
      obj.username ?? '',
      obj.password ?? ''
    );
  }

  toDataSource(): DataSource {
    const jdbcUrl = `jdbc:oracle:thin:@//${this.host}:${this.port}/${this.serviceName}`;
    const request = new JdbcSource(this.id, this.sourceType, this.displayName, jdbcUrl, this.username, this.password);
    return request;
  }

  getDisplayName(): string {
    return this.displayName;
  }
}
