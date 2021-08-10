/*
 * @author: tvc12 - Thien Vi
 * @created: 5/31/21, 4:38 PM
 */

import { DefaultSettingState } from '@/screens/DashboardDetail/Bloc/State/DefaultSettingState';

export abstract class SettingState {
  static default() {
    return new DefaultSettingState();
  }

  abstract toString(): string;
}
