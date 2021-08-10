/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:48 PM
 */

import { VizSettingData } from '@core/domain';
import { SettingState } from './SettingState';

export class VizSettingDataChanged extends SettingState {
  constructor(readonly vizSettingData: VizSettingData, readonly canQuery: boolean) {
    super();
  }
}
