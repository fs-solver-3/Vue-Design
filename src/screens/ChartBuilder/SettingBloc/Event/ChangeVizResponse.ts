/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:53 PM
 */

import { SettingEvent } from './SettingEvent';
import { VisualizationResponse } from '@core/domain/Response';
import { QuerySetting } from '@core/domain';

export class ChangeVizResponse extends SettingEvent {
  constructor(readonly vizResponse: VisualizationResponse, readonly querySetting: QuerySetting) {
    super();
  }
}
