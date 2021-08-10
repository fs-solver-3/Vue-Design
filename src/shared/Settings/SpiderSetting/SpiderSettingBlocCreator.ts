/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ObjectUtils } from '@core/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { SpiderSettingBloc } from '@/shared/Settings/SpiderSetting/SpiderSettingBloc';

export class SpiderSettingBlocCreator implements SettingBlocCreator<SpiderSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): SpiderSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new SpiderSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): SpiderSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new SpiderSettingBloc(settingAsMap, vizSettingData);
  }

  private getDefaultVizData(): SeriesVizData {
    return {
      legend: {
        enabled: true,
        verticalAlign: 'bottom',
        layout: 'horizontal',
        title: {
          text: ''
        }
      },
      xAxis: [
        {
          visible: true,
          gridLineWidth: 1,
          gridLineColor: '#FFFFFF19',
          labels: {
            style: {
              color: '#FFFFFF'
            }
          }
        }
      ],
      yAxis: [
        {
          gridLineInterpolation: 'polygon',
          gridLineColor: '#FFFFFF19',
          gridLineWidth: 1,
          labels: {
            style: {
              color: '#FFFFFF'
            }
          }
        }
      ],
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
      plotOptions: {
        series: {
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
              fontFamily: 'Barlow',
              textOutline: 0
            }
          }
        }
      }
    };
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(this.getDefaultVizData());
    ///Set new widget type to default setting
    flattenSetting.set(SettingBlocCreator.chartTypeKey, 'line');
    return flattenSetting;
  }
}
