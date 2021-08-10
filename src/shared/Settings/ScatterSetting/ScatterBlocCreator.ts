/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ObjectUtils } from '@core/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { ScatterSettingBloc } from '@/shared/Settings/ScatterSetting/ScatterSettingBloc';

export class ScatterSettingBlocCreator implements SettingBlocCreator<ScatterSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): ScatterSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new ScatterSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): ScatterSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new ScatterSettingBloc(settingAsMap, vizSettingData);
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
      background: '#0000001A',
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
      ],
      plotOptions: {
        series: {
          marker: {
            enabled: true
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
      numDataPoint: 1000
    };
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(ScatterSettingBlocCreator.getDefaultVizData());
    flattenSetting.set(SettingBlocCreator.chartTypeKey, 'scatter');
    return flattenSetting;
  }
}
