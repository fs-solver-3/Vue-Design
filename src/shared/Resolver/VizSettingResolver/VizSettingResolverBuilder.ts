/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 11:32 AM
 */

import { WidgetType } from '@/shared';
import { VizSettingHandler, VizSettingResolver } from '@/shared/Resolver';

export class VizSettingResolverBuilder {
  private handlers: Map<WidgetType, VizSettingHandler> = new Map<WidgetType, VizSettingHandler>();

  add(type: WidgetType, handler: VizSettingHandler) {
    this.handlers.set(type, handler);
    return this;
  }

  build(): VizSettingResolver {
    return new VizSettingResolver(this.handlers);
  }
}
