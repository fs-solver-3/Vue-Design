import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { SeriesQuerySetting, SeriesVizData, SeriesVizSetting, VizSetting } from '@core/domain';
import { cloneDeep } from 'lodash';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';

export class SeriesSettingBloc extends SettingBloc<SeriesVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: SeriesVizData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<SeriesVizData> {
    return new SeriesVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new SeriesSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): SeriesVizData {
    this.currentValueAsMap.set('xAxis[0].title.text', (event.querySetting as SeriesQuerySetting).xAxis.name);
    this.currentValueAsMap.set('yAxis[0].title.text', (event.querySetting as SeriesQuerySetting).yAxis[0].name);
    this.currentVizSettingData = this.buildOptions(this.currentValueAsMap);
    return cloneDeep(this.currentVizSettingData);
  }
}
