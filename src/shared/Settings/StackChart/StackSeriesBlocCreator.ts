/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { cloneDeep } from 'lodash';
import { ObjectUtils } from '@core/utils';
import { StackSeriesVizData, VizSetting, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { StackSeriesSettingBloc } from '@/shared/Settings/StackChart/StackSeriesSettingBloc';

export class StackSeriesSettingBlocCreator implements SettingBlocCreator<StackSeriesSettingBloc> {
  private static readonly chartTypeKey = 'chart.type';

  createBlocFromBloc(data: CreationBlocFromBlocData): StackSeriesSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new StackSeriesSettingBloc(flattenSetting, currentVizSettingData as StackSeriesVizData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): StackSeriesSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new StackSeriesSettingBloc(settingAsMap, vizSettingData as StackSeriesVizData);
  }

  private static getDefaultVizData(): StackSeriesVizData {
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
      plotOptions: {
        series: {
          stacking: 'normal',
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
      }
    };
  }

  private getOldSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = cloneDeep(data.oldBloc.getMapValueWithSettingKey());
    ///Remove widget type of old setting
    flattenSetting.delete(StackSeriesSettingBlocCreator.chartTypeKey);
    return flattenSetting;
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(StackSeriesSettingBlocCreator.getDefaultVizData());
    ///Set new widget type to default setting
    const type = VizSetting.CHART_TYPE_CONVERT.get(data.selectVizItem.type) ?? data.selectVizItem.type;
    flattenSetting.set(StackSeriesSettingBlocCreator.chartTypeKey, type);
    return flattenSetting;
  }
}
