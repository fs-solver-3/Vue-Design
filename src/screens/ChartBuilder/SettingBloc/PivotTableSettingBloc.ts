/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:08 PM
 */

import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState, SettingState, VizSettingDataChanged } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { PivotTableVizData, PivotTableVizSetting, VizSetting, VizSettingData } from '@core/domain';
import { cloneDeep } from 'lodash';
import { RemoveFunction, SettingEvent, SettingKey } from '@/screens/ChartBuilder/SettingBloc/Event';
import { StringUtils } from '@/utils/string.utils';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { ConfigType } from '@/shared';

export class PivotTableSettingBloc extends SettingBloc<PivotTableVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: VizSettingData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<PivotTableVizData> {
    return new PivotTableVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new PivotTableSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): PivotTableVizData {
    return cloneDeep(this.currentVizSettingData);
  }

  protected async *handleEventChange(event: SettingEvent): AsyncIterableIterator<SettingState> {
    switch (event.constructor) {
      case RemoveFunction:
        yield* this.handleRemoveFunction(event as RemoveFunction);
        break;
    }
  }

  private async *handleRemoveFunction(event: RemoveFunction) {
    const type = event.configType;
    if (type === ConfigType.rows || type === ConfigType.values) {
      const normalizedName = StringUtils.toCamelCase(event.data.name);
      this.currentValueAsMap = MapUtils.removeContainsKey(this.currentValueAsMap, [
        `fieldFormatting.${normalizedName}`,
        `conditionalFormatting.${normalizedName}`
      ]);
      this.currentVizSettingData = ChartSettingUtils2.convertToObject(this.currentValueAsMap);

      yield new VizSettingDataChanged(this.currentVizSettingData, false);
    }
  }
}
