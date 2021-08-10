/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:16 PM
 */

import { SourceType } from '@core/DataIngestion';

export abstract class DataSource {
  abstract readonly className: SourceType;
}
