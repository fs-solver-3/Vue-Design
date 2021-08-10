/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 11:14 AM
 */

import { SettingEvent, SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event/SettingEvent';

export class ChangeSetting extends SettingEvent {
  constructor(readonly valueWithSettingKey: Map<SettingKey, any>, readonly canQuery: boolean) {
    super();
  }
}
