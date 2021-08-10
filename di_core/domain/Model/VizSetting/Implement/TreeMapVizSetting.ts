/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:48 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingType } from '@core/domain/Model';

export class TreeMapVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    plotOptions: {
      treemap: {
        traverseUpButton: {
          position: {
            align: 'right'
          },
          theme: {
            fill: 'var(--transparent)',
            'stroke-width': 0.5,
            stroke: 'var(--primary)',
            r: 0,
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
        },
        dataLabels: {
          enabled: false
        },
        levelIsConstant: false,
        levels: [
          {
            level: 1,
            dataLabels: {
              enabled: true
            },
            borderWidth: 3
          }
        ]
      }
    }
  };
  chartFamilyType = ChartFamilyType.TreeMap;
  className = VizSettingType.TreeMapSetting;

  constructor(options: {} = {}) {
    super(options);
  }

  public get paletteColors() {
    return this.options.paletteColors ?? VizSetting.DEFAULT_PALETTE_COLOR;
  }

  static fromObject(obj: TreeMapVizSetting): TreeMapVizSetting {
    return new TreeMapVizSetting(obj.options);
  }
}
