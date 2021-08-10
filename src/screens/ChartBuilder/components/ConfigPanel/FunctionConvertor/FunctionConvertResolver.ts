/*
 * @author: tvc12 - Thien Vi
 * @created: 5/24/21, 11:09 AM
 */

import { ConfigType, FunctionData, WidgetType } from '@/shared';
import { FunctionConvertor, FunctionConvertorData } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/FunctionConvertor';

export class FunctionConvertResolver {
  constructor(private readonly mapConvertors: Map<WidgetType, FunctionConvertor>) {}

  canConvert(convertorData: FunctionConvertorData): boolean {
    const convertor: FunctionConvertor | undefined = this.mapConvertors.get(convertorData.itemSelected.type as WidgetType);
    return convertor?.canConvert(convertorData) ?? false;
  }

  convert(convertorData: FunctionConvertorData): Map<ConfigType, FunctionData[]> {
    const convertor: FunctionConvertor | undefined = this.mapConvertors.get(convertorData.itemSelected.type as WidgetType);
    return convertor?.convert(convertorData) ?? convertorData.mapConfigs;
  }
}
