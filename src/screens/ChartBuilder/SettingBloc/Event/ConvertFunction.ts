/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 11:14 AM
 */

import { SettingEvent } from '@/screens/ChartBuilder/SettingBloc/Event/SettingEvent';
import { ConfigType, FunctionData } from '@/shared';
import { FunctionConvertorData } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/FunctionConvertor';

export class ConvertFunction extends SettingEvent {
  constructor(public readonly convertData: FunctionConvertorData, public readonly finalConfigsAsMap: Map<ConfigType, FunctionData[]>) {
    super();
  }
}
