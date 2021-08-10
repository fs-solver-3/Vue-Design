import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { TabFilterVizSetting, TabVizData, VizSetting } from '@core/domain';
import { cloneDeep } from 'lodash';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';

export class TabFilterSettingBloc extends SettingBloc<TabVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: TabVizData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<TabVizData> {
    return new TabFilterVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new TabFilterSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): TabVizData {
    return cloneDeep(this.currentVizSettingData);
  }
}
