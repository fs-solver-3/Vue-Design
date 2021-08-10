import { MySqlSourceInfo } from './MySqlSourceInfo';
import { OracleSourceInfo } from './OracleSourceInfo';
import { MSSqlSourceInfo } from './MSSqlSourceInfo';
import { DataSourceType } from '@core/DataIngestion/Domain/DataSource/DataSourceType';
import { DataSource } from '@core/DataIngestion/Domain/Response/DataSource';
import { JdbcSource, SourceType } from '@core/DataIngestion';
import { SourceId } from '@core/domain';
import { RedshiftSourceInfo } from '@core/DataIngestion/Domain/DataSource/RedshiftSourceInfo';
import { UnsupportedException } from '@core/domain/Exception/UnsupportedException';
import { BigQuerySourceInfo } from '@core/DataIngestion/Domain/DataSource/BigQuerySourceInfo';
import { PostgreSqlSourceInfo } from '@core/DataIngestion/Domain/DataSource/PostgreSqlSourceInfo';

export abstract class DataSourceInfo {
  static readonly DEFAULT_ID = -1;
  abstract sourceType: DataSourceType;
  abstract id: SourceId;

  static fromObject(obj: any) {
    switch (obj.sourceType) {
      case DataSourceType.MySql:
        return MySqlSourceInfo.fromObject(obj);
      case DataSourceType.Oracle:
        return OracleSourceInfo.fromObject(obj);
      case DataSourceType.MSSql:
        return MSSqlSourceInfo.fromObject(obj);
      case DataSourceType.BigQuery:
        return BigQuerySourceInfo.fromObject(obj);
      case DataSourceType.Redshift:
        return RedshiftSourceInfo.fromObject(obj);
      case DataSourceType.PostgreSql:
        return PostgreSqlSourceInfo.fromObject(obj);
      default:
        throw new UnsupportedException(`Unsupported source type ${obj.sourceType}`);
    }
  }

  static fromDataSource(obj: DataSource): DataSourceInfo {
    switch (obj.className) {
      case SourceType.JdbcSource:
        return this.fromJdbcSource(obj as JdbcSource);
    }
  }

  static fromJdbcSource(obj: JdbcSource): DataSourceInfo {
    switch (obj.databaseType) {
      case DataSourceType.MySql:
        return MySqlSourceInfo.fromJdbcSource(obj);
      case DataSourceType.MSSql:
        return MSSqlSourceInfo.fromJdbcSource(obj);
      case DataSourceType.Oracle:
        return OracleSourceInfo.fromJdbcSource(obj);
      case DataSourceType.Redshift:
        return RedshiftSourceInfo.fromJdbcSource(obj);
      case DataSourceType.BigQuery:
        return BigQuerySourceInfo.fromJdbcSource(obj);
      case DataSourceType.PostgreSql:
        return PostgreSqlSourceInfo.fromJdbcSource(obj);
      default:
        throw new UnsupportedException(`Unsupported database type ${obj.databaseType}`);
    }
  }

  static default(type: DataSourceType) {
    return DataSourceInfo.fromObject({ sourceType: type as DataSourceType, id: DataSourceInfo.DEFAULT_ID });
  }

  abstract toDataSource(): DataSource;
  abstract getDisplayName(): string;
}
