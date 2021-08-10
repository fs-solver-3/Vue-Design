/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 11:43 AM
 */

import { ConditionData, ConfigType, FunctionData } from '@/shared';
import { Id, MapQuerySetting, QuerySetting, TableColumn } from '@core/domain';
import { ListUtils, QuerySettingUtils } from '@/utils';
import { getExtraData, QuerySettingHandler } from '@/shared/Resolver';

export class MapQuerySettingHandler implements QuerySettingHandler {
  canBuildQuerySetting(configsAsMap: Map<ConfigType, FunctionData[]>, filterAsMap: Map<Id, ConditionData[]>): boolean {
    return ListUtils.isNotEmpty(configsAsMap.get(ConfigType.value));
  }

  toQuerySetting(configsAsMap: Map<ConfigType, FunctionData[]>, filterAsMap: Map<Id, ConditionData[]>): QuerySetting {
    const location: TableColumn = QuerySettingUtils.buildTableColumn(configsAsMap, ConfigType.location);
    const value: TableColumn = QuerySettingUtils.buildTableColumn(configsAsMap, ConfigType.value);
    const [conditions, sortings, tooltips] = getExtraData(configsAsMap, filterAsMap);
    return new MapQuerySetting(location, value, '{}', void 0, conditions, sortings);
  }
}
