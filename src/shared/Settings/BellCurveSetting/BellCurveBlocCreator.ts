import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ChartSettingUtils2, MapUtils, MetricNumberMode } from '@/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ObjectUtils } from '@core/utils';
import { cloneDeep } from 'lodash';
import { BellCurveSettingBloc } from '@/shared/Settings/BellCurveSetting/BellCurveSettingBloc';

export class BellCurveSettingBlocCreator implements SettingBlocCreator<BellCurveSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): BellCurveSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new BellCurveSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): BellCurveSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new BellCurveSettingBloc(settingAsMap, vizSettingData);
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
      xAxis: [
        {
          title: {
            text: '',
            style: {
              fontFamily: 'Barlow',
              color: '#FFFFFF',
              fontSize: '11px'
            }
          }
        },
        {
          title: {
            text: 'Bell curve',
            style: {
              fontFamily: 'Barlow',
              color: '#FFFFFF',
              fontSize: '11px'
            }
          }
        }
      ],
      yAxis: [
        {
          title: {
            text: '',
            style: {
              fontFamily: 'Barlow',
              color: '#FFFFFF',
              fontSize: '11px'
            }
          }
        },
        {
          title: {
            text: 'Bell curve',
            style: {
              fontFamily: 'Barlow',
              color: '#FFFFFF',
              fontSize: '11px'
            }
          }
        }
      ],
      plotOptions: {
        series: {
          lineWidth: 2,
          dashStyle: 'Solid',
          marker: {
            enabled: false
          },
          dataLabels: {
            enabled: false,
            displayUnit: MetricNumberMode.None,
            style: {
              color: '#FFFFFF',
              fontSize: '11px',
              fontFamily: 'Barlow',
              textOutline: 0
            }
          }
        }
      },
      numDataPoint: 1000
    };
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(BellCurveSettingBlocCreator.getDefaultVizData());
    return flattenSetting;
  }
}
