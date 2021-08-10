import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { GaugeVizData, GaugeVizSetting, SeriesVizData, VizSetting } from '@core/domain';
import { cloneDeep } from 'lodash';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';

export class GaugeSettingBloc extends SettingBloc<GaugeVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: GaugeVizData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<GaugeVizData> {
    return new GaugeVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new GaugeSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): GaugeVizData {
    return cloneDeep(this.currentVizSettingData);
  }
}
