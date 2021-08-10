import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { SeriesOneResponse, SeriesQuerySetting, StackedVizSetting, StackSeriesVizData, VizSetting } from '@core/domain';
import { cloneDeep } from 'lodash';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';
import { StringUtils } from '@/utils/string.utils';
import { Log } from '@core/utils';

export class StackSeriesSettingBloc extends SettingBloc<StackSeriesVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: StackSeriesVizData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<StackSeriesVizData> {
    return new StackedVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new StackSeriesSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): StackSeriesVizData {
    this.currentValueAsMap.set('xAxis[0].title.text', (event.querySetting as SeriesQuerySetting).xAxis.name);
    this.currentValueAsMap.set('yAxis[0].title.text', (event.querySetting as SeriesQuerySetting).yAxis[0].name);
    this.currentVizSettingData = this.buildOptions(this.currentValueAsMap);
    const newSetting = cloneDeep(this.currentVizSettingData);
    const stackGroupFromResponse = this.buildStackGroupWith(event.vizResponse as SeriesOneResponse);
    this.updateStackSetting(newSetting, stackGroupFromResponse);
    Log.debug('StackSeriesSettingBloc:: onVizResponseChanged:: newSetting::', newSetting);
    return newSetting;
  }

  private updateStackSetting(newSetting: StackSeriesVizData, stackGroupFromResponse: Record<string, any>) {
    const stackGroupFromSetting = this.currentVizSettingData.stackingGroup;
    newSetting.stackingGroup = {
      ...stackGroupFromSetting,
      ...stackGroupFromResponse
    };
  }
  private buildStackGroupWith(response: SeriesOneResponse) {
    const series = (response as SeriesOneResponse).series;
    Log.debug('StackSeriesSettingBloc:: buildStackGroupWith:: series::', series);
    const stackGroup: Record<string, any> = {};
    series.forEach(series => {
      const normalized = StringUtils.toCamelCase(series.name);
      stackGroup[normalized] = series.stack;
    });
    return stackGroup;
  }
}
