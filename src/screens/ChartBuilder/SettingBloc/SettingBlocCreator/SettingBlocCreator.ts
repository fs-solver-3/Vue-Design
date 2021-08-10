/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 4:50 PM
 */

import { SettingBloc } from '../SettingBloc';
import { CreationBlocFromBlocData } from '@/screens/ChartBuilder/SettingBloc/SettingBlocCreator/CreationBlocFromBlocData';
import { CreationBlocFromQueryData } from '@/screens/ChartBuilder/SettingBloc/SettingBlocCreator/CreationBlocFromQueryData';
import { cloneDeep } from 'lodash';

export abstract class SettingBlocCreator<T extends SettingBloc = SettingBloc> {
  static readonly chartTypeKey = 'chart.type';
  /**
   * Use create bloc from exists bloc
   * @param data
   */
  abstract createBlocFromBloc(data: CreationBlocFromBlocData): T;

  /**
   * Use create bloc from exists query
   * @param data
   */
  abstract createBlocFromQuery(data: CreationBlocFromQueryData): T;

  static getOldSetting(data: CreationBlocFromBlocData): Map<string, any> {
    // const flattenSetting = cloneDeep(data.oldBloc.getMapValueWithSettingKey());
    // ///Remove widget type of old setting
    // flattenSetting.delete(SettingBlocCreator.chartTypeKey);
    // return flattenSetting;

    //TODO: Temp clear old setting
    return new Map();
  }
}
