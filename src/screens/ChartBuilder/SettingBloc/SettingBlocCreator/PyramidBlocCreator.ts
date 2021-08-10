/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ObjectUtils } from '@core/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { PyramidSettingBloc } from '@/screens/ChartBuilder/SettingBloc/PyramidSettingBloc';

export class PyramidSettingBlocCreator implements SettingBlocCreator<PyramidSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): PyramidSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new PyramidSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): PyramidSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new PyramidSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): SeriesVizData {
    return {
      legend: {
        enabled: true,
        verticalAlign: 'bottom',
        layout: 'horizontal',
        title: {
          text: ''
        }
      },
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
      themeColor: { enabled: true },
      // tooltip: {
      //   fontFamily: 'Barlow',
      //   backgroundColor: '#333645',
      //   valueColor: '#FFFFFF'
      // },
      // value: {
      //   color: '#ffffffcc',
      //   backgroundColor: '#0000001A',
      //   align: 'left',
      //   alternateBackgroundColor: '#00000033',
      //   alternateColor: '#ffffffcc',
      //   enableUrlIcon: false,
      //   style: {
      //     color: '#ffffffcc',
      //     fontFamily: 'Barlow',
      //     fontSize: '12px',
      //     isWordWrap: false
      //   }
      // },
      // header: {
      //   align: 'left',
      //   backgroundColor: '#0000004D',
      //   color: '#FFFFFFCC',
      //   isWordWrap: false,
      //   isAutoWidthSize: false,
      //   style: {
      //     color: '#FFFFFFCC',
      //     isWordWrap: false,
      //     fontFamily: 'Barlow',
      //     fontSize: '12px'
      //   }
      // },
      // total: {
      //   enabled: true,
      //   backgroundColor: '#00000033',
      //   label: {
      //     text: 'Total',
      //     enabled: true,
      //     align: 'left',
      //     isWordWrap: false,
      //     backgroundColor: '#2f3240',
      //     style: {
      //       fontFamily: 'Barlow',
      //       fontSize: '12px',
      //       color: '#FFFFFFCC',
      //       isWordWrap: false
      //     }
      //   }
      // },
      background: '#0000001A'
    };
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(PyramidSettingBlocCreator.getDefaultVizData());
    ///Set new widget type to default setting
    flattenSetting.set(SettingBlocCreator.chartTypeKey, data.selectVizItem.type);
    return flattenSetting;
  }
}
