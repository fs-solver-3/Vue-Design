import { DataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/DataSourceFormRender';
import { DataSourceInfo } from '@core/DataIngestion/Domain/DataSource/DataSourceInfo';
import { MsSqlDataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/MsSqlDataSourceFormRender';
import { MySqlDataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/MySqlDataSourceFormRender';
import { OracleDataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/OracleDataSourceFormRender';
import { MSSqlSourceInfo } from '@core/DataIngestion/Domain/DataSource/MSSqlSourceInfo';
import { MySqlSourceInfo } from '@core/DataIngestion/Domain/DataSource/MySqlSourceInfo';
import { OracleSourceInfo } from '@core/DataIngestion/Domain/DataSource/OracleSourceInfo';
import { DataSourceType } from '@core/DataIngestion/Domain/DataSource/DataSourceType';
import { RedshiftDataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/RedshiftDataSourceFormRender';
import { RedshiftSourceInfo } from '@core/DataIngestion/Domain/DataSource/RedshiftSourceInfo';
import { UnsupportedException } from '@core/domain/Exception/UnsupportedException';
import { BigQueryDataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/BigQueryDataSourceFormRender';
import { BigQuerySourceInfo } from '@core/DataIngestion/Domain/DataSource/BigQuerySourceInfo';
import { PostgreSqlSourceInfo } from '@core/DataIngestion/Domain/DataSource/PostgreSqlSourceInfo';
import { PostgreSqlDataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/PostgreSqlDataSourceFormRender';

export class DataSourceFormFactory {
  createRender(dataSource: DataSourceInfo): DataSourceFormRender {
    switch (dataSource.sourceType) {
      case DataSourceType.MSSql: {
        return new MsSqlDataSourceFormRender(dataSource as MSSqlSourceInfo);
      }
      case DataSourceType.MySql: {
        return new MySqlDataSourceFormRender(dataSource as MySqlSourceInfo);
      }
      case DataSourceType.Oracle: {
        return new OracleDataSourceFormRender(dataSource as OracleSourceInfo);
      }
      case DataSourceType.Redshift: {
        return new RedshiftDataSourceFormRender(dataSource as RedshiftSourceInfo);
      }
      case DataSourceType.BigQuery:
        return new BigQueryDataSourceFormRender(dataSource as BigQuerySourceInfo);
      case DataSourceType.PostgreSql:
        return new PostgreSqlDataSourceFormRender(dataSource as RedshiftSourceInfo);
      default:
        throw new UnsupportedException(`Unsupported data source type ${dataSource.sourceType}`);
    }
  }
}
