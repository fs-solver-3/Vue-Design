/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:08 PM
 */

import { SettingBloc } from '@/screens/ChartBuilder/SettingBloc/SettingBloc';
import { SettingEmptyState, SettingState, VizSettingDataChanged } from '@/screens/ChartBuilder/SettingBloc/State';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { TableVizData, TableVizSetting, VizSetting } from '@core/domain';
import { cloneDeep } from 'lodash';
import { AddFunction, ConvertFunction, RemoveFunction, SettingEvent, SettingKey, UpdateFunction } from '@/screens/ChartBuilder/SettingBloc/Event';
import { StringUtils } from '@/utils/string.utils';
import { ChartSettingUtils2, MapUtils } from '@/utils';

export class TableSettingBloc extends SettingBloc<TableVizData> {
  constructor(settingAsMap: Map<SettingKey, any>, vizSettingData: TableVizData) {
    super(settingAsMap, vizSettingData, new SettingEmptyState());
  }

  getVizSetting(): VizSetting<TableVizData> {
    return new TableVizSetting(this.currentVizSettingData);
  }

  clone(): SettingBloc {
    return new TableSettingBloc(cloneDeep(this.currentValueAsMap), cloneDeep(this.currentVizSettingData));
  }

  protected onVizResponseChanged(event: ChangeVizResponse): TableVizData {
    return cloneDeep(this.currentVizSettingData);
  }

  protected async *handleEventChange(event: SettingEvent): AsyncIterableIterator<SettingState> {
    switch (event.constructor) {
      case RemoveFunction:
        yield* this.handleRemoveFunction(event as RemoveFunction);
        break;
      case UpdateFunction:
        // nothing
        break;
      case ConvertFunction:
        yield* this.handleConvertFunction(event as ConvertFunction);
        break;
      case AddFunction:
        // nothing
        break;
    }
  }

  private async *handleRemoveFunction(event: RemoveFunction) {
    const normalizedName = StringUtils.toCamelCase(event.data.name);
    this.currentValueAsMap = MapUtils.removeContainsKey(this.currentValueAsMap, [
      `fieldFormatting.${normalizedName}`,
      `conditionalFormatting.${normalizedName}`
    ]);
    this.currentVizSettingData = ChartSettingUtils2.convertToObject(this.currentValueAsMap);

    yield new VizSettingDataChanged(this.currentVizSettingData, false);
  }

  private async *handleConvertFunction(event: ConvertFunction) {
    this.currentValueAsMap = MapUtils.removeContainsKey(this.currentValueAsMap, ['conditionalFormatting']);
    this.currentVizSettingData = ChartSettingUtils2.convertToObject(this.currentValueAsMap);
    yield new VizSettingDataChanged(this.currentVizSettingData, true);
  }
}
