/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 4:47 PM
 */

import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { TableVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { cloneDeep } from 'lodash';

export class DefaultSettingBloc extends SettingBloc {
  constructor() {
    super(new Map(), {}, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<VizSettingData> {
    return new TableVizSetting({});
  }

  protected onVizResponseChanged(event: ChangeVizResponse): VizSettingData {
    return this.currentVizSettingData;
  }

  clone(): SettingBloc {
    const defaultBloc = new DefaultSettingBloc();
    defaultBloc.currentValueAsMap = cloneDeep(this.currentValueAsMap);
    defaultBloc.currentVizSettingData = cloneDeep(this.currentVizSettingData);
    return defaultBloc;
  }
}
