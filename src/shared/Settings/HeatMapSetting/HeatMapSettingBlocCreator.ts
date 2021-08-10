/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ObjectUtils } from '@core/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { HeatMapSettingBloc } from '@/shared/Settings/HeatMapSetting/HeatMapSettingBloc';

export class HeatMapSettingBlocCreator implements SettingBlocCreator<HeatMapSettingBloc> {
  private static readonly chartTypeKey = 'chart.type';

  createBlocFromBloc(data: CreationBlocFromBlocData): HeatMapSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new HeatMapSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): HeatMapSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new HeatMapSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): SeriesVizData {
    return {
      legend: {
        enabled: true,
        verticalAlign: 'bottom',
        layout: 'horizontal'
      },
      colorAxis: {
        minColor: '#F2E8D6',
        maxColor: '#FFAC05',
        noneColor: '#F2E8D6'
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
      background: '#0000001A',
      plotOptions: {
        heatmap: {
          // lineWidth: 2,
          // dashStyle: 'Solid',
          // marker: {
          //   enabled: true
          // },
          dataLabels: {
            enabled: false,
            style: {
              color: '#FFFFFF',
              fontSize: '11px',
              fontFamily: 'Barlow'
            }
          }
        }
      }
    };
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(HeatMapSettingBlocCreator.getDefaultVizData());
    ///Set new widget type to default setting
    flattenSetting.set(HeatMapSettingBlocCreator.chartTypeKey, data.selectVizItem.type);
    return flattenSetting;
  }
}
