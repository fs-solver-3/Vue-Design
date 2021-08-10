/*
 * @author: tvc12 - Thien Vi
 * @created: 5/31/21, 11:25 PM
 */

import { SettingState } from '@/screens/DashboardDetail/Bloc';
import { DIException } from '@core/domain';
import { message } from 'ant-design-vue';

export class SettingSaveError implements SettingState {
  constructor(public message: string, ex: DIException) {}

  toString(): string {
    return 'SettingSaveError::' + message;
  }
}
