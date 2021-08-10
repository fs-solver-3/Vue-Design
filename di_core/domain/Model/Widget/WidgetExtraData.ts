/*
 * @author: tvc12 - Thien Vi
 * @created: 12/17/20, 11:49 AM
 */

import { ConditionData, ConfigType, FunctionData } from '@/shared';
import { Id } from '@core/domain/Model';
import { TabItem } from '@/shared/models';

export interface WidgetExtraData {
  configs: Record<ConfigType, FunctionData[]>;
  filters: Record<Id, ConditionData[]>;
  tabItems: TabItem[];
  currentChartType: string;
}
