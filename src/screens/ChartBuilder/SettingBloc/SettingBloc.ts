/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 11:11 AM
 */

import { Bloc, DefaultBlocLogger } from '@/shared/Bloc';
import { ChangeSetting, RemoveContainsKey, SettingKey } from './Event';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { DIException, QuerySetting, VisualizationResponse, VizSetting, VizSettingData } from '@core/domain';
import { SettingEvent } from './Event/SettingEvent';
import { SettingState } from './State/SettingState';
import { VizSettingDataChanged } from '@/screens/ChartBuilder/SettingBloc/State/VizSettingDataChanged';
import { ChangeVizResponse } from '@/screens/ChartBuilder/SettingBloc/Event/ChangeVizResponse';
import { VizSettingError } from '@/screens/ChartBuilder/SettingBloc/State/VIzSettingError';
import { Cloneable } from '@/screens/DashboardDetail/Bloc/Clonable';
import { ObjectUtils } from '@core/utils';

export abstract class SettingBloc<SettingData extends VizSettingData = VizSettingData> extends Bloc<SettingEvent, SettingState>
  implements Cloneable<SettingBloc> {
  protected constructor(protected currentValueAsMap: Map<SettingKey, any>, protected currentVizSettingData: SettingData, state: SettingState) {
    super(state, new DefaultBlocLogger());
  }

  getMapValueWithSettingKey(): Map<SettingKey, any> {
    return this.currentValueAsMap;
  }

  getVizSettingData(): SettingData {
    return this.currentVizSettingData;
  }

  setVizSettingData(vizSettingData: SettingData): void {
    this.currentVizSettingData = vizSettingData;
  }

  setSettingAsMap(currentValueAsMap: Map<SettingKey, any>) {
    this.currentValueAsMap = currentValueAsMap;
  }

  changeSetting(key: SettingKey, value: any, canQuery?: boolean): void {
    this.add(new ChangeSetting(new Map([[key, value]]), canQuery ?? false));
  }

  removeSetting(key: SettingKey, canQuery?: boolean): void {
    this.add(new RemoveContainsKey(key, canQuery ?? false));
  }

  multiChangeSetting(valueWithKey: Map<SettingKey, any>, canQuery?: boolean): void {
    this.add(new ChangeSetting(valueWithKey, canQuery ?? false));
  }

  changeResponse(response: VisualizationResponse, querySetting: QuerySetting) {
    this.add(new ChangeVizResponse(response, querySetting));
  }

  abstract getVizSetting(): VizSetting<SettingData>;

  abstract clone(): SettingBloc;

  protected async *mapEventToState(event: SettingEvent): AsyncIterableIterator<SettingState> {
    switch (event.constructor) {
      case ChangeSetting:
        yield* this._changeSetting(event as ChangeSetting);
        break;
      case ChangeVizResponse:
        yield* this._changeVizResponse(event as ChangeVizResponse);
        break;
      case RemoveContainsKey:
        yield* this._removeContainsKey(event as RemoveContainsKey);
        break;
      default:
        yield* this.handleEventChange(event);
        break;
    }
  }

  protected async *handleEventChange(event: SettingEvent): AsyncIterableIterator<SettingState> {
    //
  }

  protected abstract onVizResponseChanged(event: ChangeVizResponse): SettingData;

  private *_changeSetting(event: ChangeSetting) {
    try {
      this.currentValueAsMap = MapUtils.merge(this.currentValueAsMap, event.valueWithSettingKey);
      this.currentVizSettingData = this.buildOptions(this.currentValueAsMap);
      yield new VizSettingDataChanged(this.currentVizSettingData, event.canQuery);
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      yield new VizSettingError(exception);
    }
  }

  protected buildOptions(currentMapValueSetting: Map<SettingKey, any>): SettingData {
    return ChartSettingUtils2.convertToObject(currentMapValueSetting) as SettingData;
  }

  private *_changeVizResponse(event: ChangeVizResponse) {
    try {
      this.currentVizSettingData = this.onVizResponseChanged(event);
      this.currentValueAsMap = ObjectUtils.flatKey(this.currentVizSettingData);
      yield new VizSettingDataChanged(this.currentVizSettingData, false);
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      yield new VizSettingError(exception);
    }
  }

  private async *_removeContainsKey(event: RemoveContainsKey) {
    try {
      this.currentValueAsMap = MapUtils.removeContainsKey(this.currentValueAsMap, [event.key]);
      this.currentVizSettingData = this.buildOptions(this.currentValueAsMap);
      yield new VizSettingDataChanged(this.currentVizSettingData, event.canQuery === true);
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      yield new VizSettingError(exception);
    }
  }
}
