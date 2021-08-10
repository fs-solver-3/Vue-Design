/*
 * @author: tvc12 - Thien Vi
 * @created: 5/31/21, 4:37 PM
 */

import { SettingState } from '@/screens/DashboardDetail/Bloc/State/SettingState';
import { SettingEvent } from '@/screens/DashboardDetail/Bloc/Event/SettingEvent';
import { ApplySetting } from '@/screens/DashboardDetail/Bloc/Event';
import { DashboardService, DataManager } from '@core/services';
import { Inject } from 'typescript-ioc';
import { Log } from '@core/utils';
import { SettingSaved, SettingSaving } from '@/screens/DashboardDetail/Bloc/State';
import { Bloc, DefaultBlocLogger } from '@/shared/Bloc';
import { SettingSaveError } from '@/screens/DashboardDetail/Bloc/State/SettingSaveError';
import { DashboardSetting, DIException } from '@core/domain';

export class SettingBloc extends Bloc<SettingEvent, SettingState> {
  @Inject
  private dashboardService!: DashboardService;

  @Inject
  private dataManager!: DataManager;

  constructor() {
    super(SettingState.default(), new DefaultBlocLogger());
  }

  protected async *mapEventToState(event: SettingEvent): AsyncIterableIterator<SettingState> {
    switch (event.constructor) {
      case ApplySetting:
        yield* this.applySetting(event as ApplySetting);
        break;
    }
  }

  private async *applySetting(event: ApplySetting): AsyncIterableIterator<SettingState> {
    try {
      yield new SettingSaving();
      await this.dashboardService.editSetting(event.id, event.setting);
      this.dataManager.saveDashboardSetting(event.id, event.setting);
      yield new SettingSaved();
    } catch (ex) {
      yield new SettingSaveError('Save setting error, try again', DIException.fromObject(ex));
      Log.error('Apply setting error', ex);
    }
  }
}
