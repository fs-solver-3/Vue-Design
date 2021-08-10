/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ObjectUtils } from '@core/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { HistogramSettingBloc } from '@/shared/Settings/HistogramSetting/HistogramSettingBloc';

export class HistogramSettingBlocCreator implements SettingBlocCreator<HistogramSettingBloc> {
  private static readonly chartTypeKey = 'chart.type';

  createBlocFromBloc(data: CreationBlocFromBlocData): HistogramSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new HistogramSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): HistogramSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new HistogramSettingBloc(settingAsMap, vizSettingData);
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
          groupPadding: 0,
          pointPadding: 0,
          borderWidth: 0.5,
          lineWidth: 2,
          dashStyle: 'Solid',
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
      binsNumber: 5
    };
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(HistogramSettingBlocCreator.getDefaultVizData());
    ///Set new widget type to default setting
    flattenSetting.set(HistogramSettingBlocCreator.chartTypeKey, 'column');
    return flattenSetting;
  }
}
