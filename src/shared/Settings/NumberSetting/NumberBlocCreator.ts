/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { cloneDeep } from 'lodash';
import { ObjectUtils } from '@core/utils';
import { NumberVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { NumberSettingBloc } from '@/shared/Settings/NumberSetting/NumberSettingBloc';

export class NumberBlocCreator implements SettingBlocCreator<NumberSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): NumberSettingBloc {
    const defaultSettingKey: Map<string, any> = ObjectUtils.flatKey(NumberBlocCreator.getDefaultVizData());
    const oldSettingKey = cloneDeep(data.oldBloc.getMapValueWithSettingKey());

    const currentSettingKeyAsMap: Map<string, any> = MapUtils.merge(defaultSettingKey, oldSettingKey);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(currentSettingKeyAsMap);
    return new NumberSettingBloc(currentSettingKeyAsMap, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): NumberSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new NumberSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): NumberVizData {
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
      style: {
        color: '#FFFFFFFF',
        fontFamily: 'Barlow',
        fontSize: '48px'
      },
      align: 'center',
      prefix: {
        enabled: true,
        text: '',
        isWordWrap: false,
        style: {
          color: '#FFFFFFFF',
          fontFamily: 'Barlow',
          fontSize: '48px'
        }
      },
      postfix: {
        enabled: true,
        text: '',
        isWordWrap: false,
        style: {
          color: '#FFFFFFFF',
          fontFamily: 'Barlow',
          fontSize: '48px'
        }
      },
      affectedByFilter: true,
      tooltip: {
        fontFamily: 'Barlow',
        backgroundColor: '#333645',
        valueColor: '#FFFFFF'
      },
      background: '#0000001A'
    };
  }
}
