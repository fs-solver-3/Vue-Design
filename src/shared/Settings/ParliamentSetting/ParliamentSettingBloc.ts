import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { BellCurveVizSetting, ParliamentSettingData, ParliamentVizSetting, VizSetting } from '@core/domain';
import { cloneDeep } from 'lodash';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';

export class ParliamentSettingBloc extends SettingBloc<ParliamentSettingData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: ParliamentSettingData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<ParliamentSettingData> {
    return new ParliamentVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new ParliamentSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): ParliamentSettingData {
    return cloneDeep(this.currentVizSettingData);
  }
}
