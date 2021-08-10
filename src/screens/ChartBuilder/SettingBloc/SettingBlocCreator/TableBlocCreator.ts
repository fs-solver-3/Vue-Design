/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { TableSettingBloc } from '@/screens/ChartBuilder/SettingBloc/TableSettingBloc';
import { TableVizData, VizSettingData } from '@core/domain';
import { cloneDeep } from 'lodash';
import { ObjectUtils } from '@core/utils';
import { ChartSettingUtils2, MapUtils } from '@/utils';

export class TableSettingBlocCreator implements SettingBlocCreator<TableSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): TableSettingBloc {
    const defaultSettingKey: Map<string, any> = ObjectUtils.flatKey(TableSettingBlocCreator.getDefaultVizData());
    const oldSettingKey = cloneDeep(data.oldBloc.getMapValueWithSettingKey());

    const currentSettingKeyAsMap: Map<string, any> = MapUtils.merge(defaultSettingKey, oldSettingKey);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(currentSettingKeyAsMap);
    return new TableSettingBloc(currentSettingKeyAsMap, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): TableSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new TableSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): TableVizData {
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
      toggleIcon: {
        color: '#FFFFFF66',
        backgroundColor: '#FFFFFF19'
      },
      background: '#0000001A'
    };
  }
}
