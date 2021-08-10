/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { PivotTableSettingBloc } from '@/screens/ChartBuilder/SettingBloc/PivotTableSettingBloc';
import { cloneDeep } from 'lodash';
import { ObjectUtils } from '@core/utils';
import { PivotTableVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';

export class PivotTableSettingBlocCreator implements SettingBlocCreator<PivotTableSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): PivotTableSettingBloc {
    const defaultSettingKey: Map<string, any> = ObjectUtils.flatKey(PivotTableSettingBlocCreator.getDefaultVizData());
    const oldSettingKey = cloneDeep(data.oldBloc.getMapValueWithSettingKey());

    const currentSettingKeyAsMap: Map<string, any> = MapUtils.merge(defaultSettingKey, oldSettingKey);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(currentSettingKeyAsMap);
    return new PivotTableSettingBloc(currentSettingKeyAsMap, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): PivotTableSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new PivotTableSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): PivotTableVizData {
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
      grid: {
        horizontal: {
          color: '#0000001A',
          thickness: '1px',
          rowPadding: '0px',
          applyBody: true,
          applyHeader: true,
          applyTotal: true
        },
        vertical: {
          color: '#0000001A',
          thickness: '1px',
          applyBody: true,
          applyHeader: true,
          applyTotal: true
        }
      },
      affectedByFilter: true,
      tooltip: {
        fontFamily: 'Barlow',
        backgroundColor: '#333645',
        valueColor: '#FFFFFF'
      },
      value: {
        color: '#ffffffcc',
        backgroundColor: '#0000001A',
        align: 'left',
        alternateBackgroundColor: '#00000033',
        alternateColor: '#ffffffcc',
        enableUrlIcon: false,
        style: {
          color: '#ffffffcc',
          fontFamily: 'Barlow',
          fontSize: '12px',
          isWordWrap: false
        }
      },
      header: {
        align: 'left',
        backgroundColor: '#0000004D',
        color: '#FFFFFFCC',
        isWordWrap: false,
        isAutoWidthSize: false,
        style: {
          color: '#FFFFFFCC',
          isWordWrap: false,
          fontFamily: 'Barlow',
          fontSize: '12px'
        }
      },
      total: {
        enabled: true,
        backgroundColor: '#00000033',
        label: {
          text: 'Total',
          enabled: true,
          align: 'left',
          isWordWrap: false,
          backgroundColor: '#2f3240',
          style: {
            fontFamily: 'Barlow',
            fontSize: '12px',
            color: '#FFFFFFCC',
            isWordWrap: false
          }
        }
      },
      toggleIcon: {
        color: '#FFFFFF66',
        backgroundColor: '#FFFFFF19'
      },
      background: '#0000001A'
    };
  }
}
