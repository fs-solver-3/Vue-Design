/*
 * @author: tvc12 - Thien Vi
 * @created: 6/25/21, 2:20 PM
 */

import { VisualizationItemData } from '@/shared';
import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc';

export interface CreationBlocFromBlocData {
  selectVizItem: VisualizationItemData;
  oldBloc: SettingBloc;
}
