/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 4:50 PM
 */

import { WidgetType } from '@/shared';
import { SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc/SettingBlocCreator/SettingBlocCreator';
import { SettingBlocResolver } from '@/screens/ChartBuilder/SettingBloc/SettingBlocCreator/SettingBlocResolver';

export class SettingBlocBuilder {
  readonly mapCreators: Map<WidgetType, SettingBlocCreator> = new Map();

  add(type: WidgetType, creator: SettingBlocCreator): SettingBlocBuilder {
    this.mapCreators.set(type, creator);
    return this;
  }

  build(): SettingBlocResolver {
    return new SettingBlocResolver(this.mapCreators);
  }
}
