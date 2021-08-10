/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { cloneDeep } from 'lodash';
import { ObjectUtils } from '@core/utils';
import { TabVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { TabFilterSettingBloc } from '@/shared/Settings/TabFilterSetting/TabFilterSettingBloc';

export class TabFilterSettingBlocCreator implements SettingBlocCreator<TabFilterSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): TabFilterSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new TabFilterSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): TabFilterSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new TabFilterSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): TabVizData {
    return {
      title: {
        align: 'center',
        enabled: true,
        text: 'Untitled chart',
        style: {
          color: '#ffffff',
          fontFamily: 'Barlow',
          fontSize: '20px'
        }
      },
      subtitle: {
        align: 'center',
        enabled: true,
        text: '',
        style: {
          color: '#ffffff',
          fontFamily: 'Barlow',
          fontSize: '20px'
        }
      },
      affectedByFilter: true,
      background: '#0000001A'
    };
  }

  private getOldSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = cloneDeep(data.oldBloc.getMapValueWithSettingKey());
    return flattenSetting;
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(TabFilterSettingBlocCreator.getDefaultVizData());
    return flattenSetting;
  }
}
