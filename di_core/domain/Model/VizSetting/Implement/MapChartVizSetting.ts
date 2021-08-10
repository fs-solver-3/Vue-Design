/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:48 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';

export class MapChartVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    chart: {
      resetZoomButton: {
        theme: {
          fill: '#3a3d4d',
          'stroke-width': 0.5,
          stroke: 'var(--primary)',
          r: 0,
          style: {
            color: '#ffffff'
          },
          states: {
            hover: {
              fill: 'var(--primary)'
            },
            select: {
              stroke: 'var(--primary)',
              fill: 'var(--primary)'
            }
          }
        }
      }
    },
    colorAxis: {
      minColor: '#e8e8f5',
      maxColor: '#8a8ae2'
    },
    plotOptions: {
      map: {
        color: '#F2E8D6'
      }
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        align: 'left',
        verticalAlign: 'bottom',
        theme: {
          fill: '#3a3d4d',
          'stroke-width': 0.5,
          stroke: 'var(--primary)',
          r: 0,
          style: {
            color: '#ffffff'
          },
          states: {
            hover: {
              fill: 'var(--primary)'
            },
            select: {
              stroke: 'var(--primary)',
              fill: 'var(--primary)'
            }
          }
        }
      }
    }
  };
  readonly chartFamilyType = ChartFamilyType.Map;
  readonly className = VizSettingType.MapSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: MapChartVizSetting): MapChartVizSetting {
    return new MapChartVizSetting(obj.options);
  }
}
