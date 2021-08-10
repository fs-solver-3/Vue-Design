/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:06 PM
 */

import { WidgetType } from '@/shared';
import { SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc/SettingBlocCreator/SettingBlocCreator';
import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBloc } from '@/screens/ChartBuilder/SettingBloc';
import { DefaultSettingBloc } from '@/screens/ChartBuilder/SettingBloc/DefaultSettingBloc';

export class SettingBlocResolver {
  constructor(readonly mapCreators: Map<WidgetType, SettingBlocCreator>) {}

  /**
   * Tạo ra bloc từ một bloc khác, sẽ tận dụng các setting trước của bloc đó
   * @param data
   */
  createBlocFromBloc(data: CreationBlocFromBlocData): SettingBloc {
    const creator: SettingBlocCreator | undefined = this.mapCreators.get(data.selectVizItem.type as WidgetType);
    if (creator) {
      return creator.createBlocFromBloc(data);
    } else {
      return new DefaultSettingBloc();
    }
  }

  /**
   * Tạo ra bloc từ một query có sẵn
   * @param data
   */
  createBlocFromQuery(data: CreationBlocFromQueryData): SettingBloc {
    const creator: SettingBlocCreator | undefined = this.mapCreators.get(data.selectVizItem.type as WidgetType);
    if (creator) {
      return creator.createBlocFromQuery(data);
    } else {
      return new DefaultSettingBloc();
    }
  }
}
