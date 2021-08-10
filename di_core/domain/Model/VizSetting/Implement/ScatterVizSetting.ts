/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:46 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';
import { toNumber } from 'lodash';

export class ScatterVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    yAxis: [
      {
        gridLineWidth: 0.5,
        gridLineColor: 'var(--grid-line-color)',
        tickLength: 0
        // gridLineDashStyle: 'longdash'
      }
    ],
    xAxis: {
      gridLineWidth: 0.5,
      lineWidth: 0.5,
      gridLineColor: 'var(--grid-line-color)',
      // gridLineDashStyle: 'longdash'
      startOnTick: true,
      endOnTick: true,
      showLastLabel: true
    },
    plotOptions: {
      scatter: {
        tooltip: {
          headerFormat: '<b>{series.name}</b><br>',
          pointFormat: '{point.x}, {point.y}'
        }
      }
    }
  };
  readonly chartFamilyType = ChartFamilyType.Scatter;
  readonly className = VizSettingType.ScatterSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: ScatterVizSetting): ScatterVizSetting {
    return new ScatterVizSetting(obj.options);
  }

  getNumDataPoint(): number | undefined {
    const numDataPoint: number = toNumber(this.options.numDataPoint);
    return isNaN(numDataPoint) ? void 0 : numDataPoint;
  }
}
