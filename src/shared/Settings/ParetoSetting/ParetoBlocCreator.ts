import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { Log, ObjectUtils } from '@core/utils';
import { ParetoSettingBloc } from '@/shared/Settings/ParetoSetting/ParetoSettingBloc';

export class ParetoSettingBlocCreator implements SettingBlocCreator<ParetoSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): ParetoSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    Log.debug('createBlocFromBloc::currentVizSettingData::', currentVizSettingData);
    return new ParetoSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): ParetoSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new ParetoSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): SeriesVizData {
    return {
      chart: {
        type: 'column'
      },
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
      xAxis: [
        {
          labels: {
            style: {
              color: '#FFFFFF'
            }
          },
          title: {
            style: {
              color: '#FFFFFF'
            }
          }
        }
      ],
      yAxis: [
        {
          labels: {
            style: {
              color: '#FFFFFF'
            }
          },
          title: {
            style: {
              color: '#FFFFFF'
            }
          }
        },
        {
          labels: {
            style: {
              color: '#FFFFFF'
            }
          },
          title: {
            style: {
              color: '#FFFFFF'
            },
            text: 'Pareto'
          }
        }
      ],
      affectedByFilter: true,
      background: '#0000001A',
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
              fontFamily: 'Barlow',
              textOutline: 0
            }
          }
        }
      }
    };
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(ParetoSettingBlocCreator.getDefaultVizData());
    ///Set new widget type to default setting
    flattenSetting.set(SettingBlocCreator.chartTypeKey, 'column');
    Log.debug('flattenSetting:: default', flattenSetting);
    return flattenSetting;
  }
}
