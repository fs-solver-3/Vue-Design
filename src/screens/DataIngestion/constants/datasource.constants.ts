import { ItemData, VisualizationItemData } from '@/shared';
import { DataSourceType } from '@core/DataIngestion/Domain/DataSource/DataSourceType';

export const ALL_DATASOURCE: ItemData[] = [
  {
    title: 'MySql',
    src: 'ic_mysql.png',
    type: DataSourceType.MySql
  },
  {
    title: 'Oracle',
    src: 'ic_oracle.png',
    type: DataSourceType.Oracle
  },
  {
    title: 'MSSql',
    src: 'ic_sql_server.png',
    type: DataSourceType.MSSql
  },
  {
    title: 'Redshift',
    src: 'ic_redshift.png',
    type: DataSourceType.Redshift
  },
  {
    title: 'BigQuery',
    src: 'ic_big_query.png',
    type: DataSourceType.BigQuery
  },
  {
    title: 'PostgreSql',
    src: 'ic_postgresql.png',
    type: DataSourceType.PostgreSql
  },
  {
    title: 'Csv',
    src: 'ic_default.svg',
    type: 'csv'
  }
];
