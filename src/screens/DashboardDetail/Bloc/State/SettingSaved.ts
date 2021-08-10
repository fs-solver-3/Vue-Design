/*
 * @author: tvc12 - Thien Vi
 * @created: 5/31/21, 5:19 PM
 */

import { SettingState } from '@/screens/DashboardDetail/Bloc';

export class SettingSaved implements SettingState {
  toString(): string {
    return 'SettingSaved';
  }
}
