import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { ParetoQuerySetting, ParetoVizSetting, SeriesVizData, VizSetting } from '@core/domain';
import { cloneDeep } from 'lodash';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';

export class ParetoSettingBloc extends SettingBloc<SeriesVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: SeriesVizData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<SeriesVizData> {
    return new ParetoVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new ParetoSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): SeriesVizData {
    this.currentValueAsMap.set('xAxis[0].title.text', (event.querySetting as ParetoQuerySetting).xAxis.name);
    this.currentValueAsMap.set('yAxis[0].title.text', (event.querySetting as ParetoQuerySetting).yAxis[0].name);
    this.currentVizSettingData = this.buildOptions(this.currentValueAsMap);
    return cloneDeep(this.currentVizSettingData);
  }
}
