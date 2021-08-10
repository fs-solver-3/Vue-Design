/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:17 PM
 */

import { DataSourceType, SourceType } from '@core/DataIngestion';
import { DataSource } from '@core/DataIngestion/Domain/Response/DataSource';
import { SourceId } from '@core/domain';

export class JdbcSource implements DataSource {
  id: SourceId;
  databaseType: DataSourceType;
  displayName: string;
  jdbcUrl: string;
  username: string;
  password: string;
  readonly className = SourceType.JdbcSource;

  constructor(id: SourceId, databaseType: DataSourceType, displayName: string, jdbcURL: string, username: string, password: string) {
    this.id = id;
    this.displayName = displayName;
    this.databaseType = databaseType;
    this.jdbcUrl = jdbcURL;
    this.username = username;
    this.password = password;
  }
}
