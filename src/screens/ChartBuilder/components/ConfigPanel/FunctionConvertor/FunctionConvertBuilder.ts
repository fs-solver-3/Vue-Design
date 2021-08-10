/*
 * @author: tvc12 - Thien Vi
 * @created: 5/24/21, 11:47 AM
 */

import { WidgetType } from '@/shared';
import { FunctionConvertor } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/FunctionConvertor';
import { FunctionConvertResolver } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/FunctionConvertResolver';

export class FunctionConvertBuilder {
  private readonly mapConvertors = new Map<WidgetType, FunctionConvertor>();

  add(type: WidgetType, convertor: FunctionConvertor): FunctionConvertBuilder {
    this.mapConvertors.set(type, convertor);
    return this;
  }

  build(): FunctionConvertResolver {
    return new FunctionConvertResolver(this.mapConvertors);
  }
}
