/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ObjectUtils } from '@core/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { FunnelSettingBloc } from '@/screens/ChartBuilder/SettingBloc/FunnelSettingBloc';

export class FunnelSettingBlocCreator implements SettingBlocCreator<FunnelSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): FunnelSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new FunnelSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): FunnelSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new FunnelSettingBloc(settingAsMap, vizSettingData);
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
    const flattenSetting = ObjectUtils.flatKey(FunnelSettingBlocCreator.getDefaultVizData());
    ///Set new widget type to default setting
    flattenSetting.set(SettingBlocCreator.chartTypeKey, data.selectVizItem.type);
    return flattenSetting;
  }
}
