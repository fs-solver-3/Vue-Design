/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:08 PM
 */

import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { NumberVizData, NumberVizSetting, PivotTableVizData, PivotTableVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { cloneDeep } from 'lodash';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';

export class NumberSettingBloc extends SettingBloc<NumberVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: VizSettingData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<NumberVizData> {
    return new NumberVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new NumberSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): NumberVizData {
    return cloneDeep(this.currentVizSettingData);
  }
}
