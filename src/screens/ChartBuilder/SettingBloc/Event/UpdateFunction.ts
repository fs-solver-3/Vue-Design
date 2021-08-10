/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 11:14 AM
 */

import { SettingEvent } from '@/screens/ChartBuilder/SettingBloc/Event/SettingEvent';
import { ConfigType, FunctionData } from '@/shared';

export class UpdateFunction extends SettingEvent {
  constructor(public readonly configType: ConfigType, public readonly currentFunctionData: FunctionData, public readonly oldFunctionData: FunctionData) {
    super();
  }
}
