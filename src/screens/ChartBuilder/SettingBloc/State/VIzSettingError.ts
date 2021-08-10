/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:48 PM
 */

import { DIException } from '@core/domain';
import { SettingState } from './SettingState';

export class VizSettingError extends SettingState {
  constructor(readonly exception: DIException) {
    super();
  }
}
