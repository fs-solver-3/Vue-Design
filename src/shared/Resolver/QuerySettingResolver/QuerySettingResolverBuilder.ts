/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 11:32 AM
 */

import { WidgetType } from '@/shared';
import { QuerySettingHandler, QuerySettingResolver } from '@/shared/Resolver';

export class QuerySettingResolverBuilder {
  private mapCreator = new Map<WidgetType, QuerySettingHandler>();

  add(chartType: WidgetType, fn: QuerySettingHandler): QuerySettingResolverBuilder {
    this.mapCreator.set(chartType, fn);
    return this;
  }

  build(): QuerySettingResolver {
    return new QuerySettingResolver(this.mapCreator);
  }
}
