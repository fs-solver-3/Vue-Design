/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:46 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, VizSettingData, VizSettingType } from '@core/domain/Model';
import { toNumber } from 'lodash';

export class BubbleVizSetting extends VizSetting {
  static readonly DEFAULT_SETTING = {
    // yAxis:{
    //   maxPadding:100
    // },
    yAxis: [
      {
        gridLineWidth: 0.5,
        gridLineColor: 'var(--grid-line-color)',
        tickLength: 0
        // gridLineDashStyle: 'longdash'
      }
    ],
    xAxis: [
      {
        maxPadding: 0,
        gridLineWidth: 0,
        gridLineColor: 'var(--grid-line-color)'
        // gridLineDashStyle: 'longdash'
      }
    ],
    // colorAxis: {
    //   maxColor: 'var(--heatmap-max)',
    //   minColor: 'var(--heatmap-min)',
    //   stops:[
    //     [0, '#3060cf'],
    //     [0.5, '#fffbbc'],
    //     [0.9, '#c4463a'],
    //     [1, '#c4463a']
    //   ]
    // }
    // plotOptions: {
    //   bubble: {
    //     opacity: 0.5
    //   }
    // }
    plotOptions: {
      bubble: {
        //     opacity: 0.5
        marker: {
          states: {
            hover: {
              lineWidth: 0
            }
          }
        }
      }
    }
  };
  chartFamilyType = ChartFamilyType.Bubble;
  className = VizSettingType.BubbleSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: BubbleVizSetting): BubbleVizSetting {
    return new BubbleVizSetting(obj.options);
  }

  getNumDataPoint(): number | undefined {
    const numDataPoint: number = toNumber(this.options.numDataPoint);
    return isNaN(numDataPoint) ? void 0 : numDataPoint;
  }
}
