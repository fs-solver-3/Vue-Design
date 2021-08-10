/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 11:14 AM
 */

import { SettingEvent } from '@/screens/ChartBuilder/SettingBloc/Event/SettingEvent';

export class RemoveContainsKey extends SettingEvent {
  constructor(readonly key: string, readonly canQuery?: boolean) {
    super();
  }
}
