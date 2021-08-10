/*
 * @author: tvc12 - Thien Vi
 * @created: 5/31/21, 4:49 PM
 */

import { DashboardId, DashboardSetting } from '@core/domain';
import { SettingEvent } from '@/screens/DashboardDetail/Bloc';

export class ApplySetting implements SettingEvent {
  constructor(public id: DashboardId, public setting: DashboardSetting) {}

  toString(): string {
    return 'ApplySetting::setting' + this.setting;
  }
}
