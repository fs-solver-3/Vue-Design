/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ObjectUtils } from '@core/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { BubbleSettingBloc } from '@/shared/Settings/BubbleSetting/BubbleSettingBloc';

export class BubbleSettingBlocCreator implements SettingBlocCreator<BubbleSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): BubbleSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new BubbleSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): BubbleSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new BubbleSettingBloc(settingAsMap, vizSettingData);
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
      background: '#0000001A',
      plotOptions: {
        series: {
          marker: {
            lineWidth: 0
          },
          dataLabels: {
            enabled: false,
            style: {
              color: '#FFFFFF',
              fontSize: '11px',
              fontFamily: 'Barlow'
            }
          }
        }
      },
      numDataPoint: 1000,
      xAxis: [
        {
          gridLineColor: '#FFFFFF19',
          gridLineDashStyle: 'Solid',
          gridLineWidth: 1,
          labels: {
            style: {
              color: '#FFFFFF'
            }
          },
          title: {
            style: {
              color: '#FFFFFF'
            },
            text: ''
          }
        }
      ],
      yAxis: [
        {
          gridLineColor: '#FFFFFF19',
          gridLineDashStyle: 'Solid',
          gridLineWidth: 1,
          labels: {
            style: {
              color: '#FFFFFF'
            }
          },
          title: {
            style: {
              color: '#FFFFFF'
            },
            text: ''
          }
        }
      ]
    };
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(BubbleSettingBlocCreator.getDefaultVizData());
    flattenSetting.set(SettingBlocCreator.chartTypeKey, 'bubble');
    return flattenSetting;
  }
}
