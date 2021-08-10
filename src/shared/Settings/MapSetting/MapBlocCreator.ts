/*
 * @author: tvc12 - Thien Vi
 * @created: 6/15/21, 5:07 PM
 */

import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { cloneDeep } from 'lodash';
import { ObjectUtils } from '@core/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { MapSettingBloc } from '@/shared/Settings/MapSetting/MapSettingBloc';

export class MapSettingBlocCreator implements SettingBlocCreator<MapSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): MapSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new MapSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): MapSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new MapSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): SeriesVizData {
    return {
      chart: {
        // resetZoomButton: {
        //   theme: {
        //     fill: '#3a3d4d',
        //     'stroke-width': 0.5,
        //     stroke: 'var(--primary)',
        //     r: 0,
        //     style: {
        //       color: '#ffffff'
        //     },
        //     states: {
        //       hover: {
        //         fill: 'var(--primary)'
        //       },
        //       select: {
        //         stroke: 'var(--primary)',
        //         fill: 'var(--primary)'
        //       }
        //     }
        //   }
        // }
      },
      colorAxis: {
        minColor: '#F2E8D6',
        maxColor: '#FFAC05',
        noneColor: '#F2E8D6',
        labels: {
          style: {
            color: '#FFFFFF'
          }
        }
      },
      plotOptions: {
        map: {
          color: '#F2E8D6',
          borderWidth: 0.5,
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
      },
      geoArea: 'world.json',
      mapNavigation: {
        enabled: true
      }
    };
  }

  private getOldSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = cloneDeep(data.oldBloc.getMapValueWithSettingKey());
    flattenSetting.delete(SettingBlocCreator.chartTypeKey);
    return flattenSetting;
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(MapSettingBlocCreator.getDefaultVizData());
    flattenSetting.set(SettingBlocCreator.chartTypeKey, 'map');
    return flattenSetting;
  }
}
