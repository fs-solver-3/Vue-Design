import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { BubbleQuerySetting, BubbleVizSetting, SeriesVizData, VizSetting } from '@core/domain';
import { cloneDeep } from 'lodash';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';

export class BubbleSettingBloc extends SettingBloc<SeriesVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: SeriesVizData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<SeriesVizData> {
    return new BubbleVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new BubbleSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): SeriesVizData {
    this.currentValueAsMap.set('xAxis[0].title.text', (event.querySetting as BubbleQuerySetting).xAxis.name);
    this.currentValueAsMap.set('yAxis[0].title.text', (event.querySetting as BubbleQuerySetting).yAxis.name);
    this.currentVizSettingData = this.buildOptions(this.currentValueAsMap);
    return cloneDeep(this.currentVizSettingData);
  }
}
