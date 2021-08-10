import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { FunnelVizSetting, SeriesVizData, VizSetting } from '@core/domain';
import { cloneDeep } from 'lodash';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';

export class FunnelSettingBloc extends SettingBloc<SeriesVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: SeriesVizData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<SeriesVizData> {
    return new FunnelVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new FunnelSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): SeriesVizData {
    return cloneDeep(this.currentVizSettingData);
  }
}
