/*
 * @author: tvc12 - Thien Vi
 * @created: 6/25/21, 2:20 PM
 */

import { VisualizationItemData } from '@/shared';
import { QuerySetting } from '@core/domain';

export interface CreationBlocFromQueryData {
  selectVizItem: VisualizationItemData;
  query: QuerySetting;
}
