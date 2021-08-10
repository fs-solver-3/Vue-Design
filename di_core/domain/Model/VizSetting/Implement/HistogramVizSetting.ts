/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:48 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';

export class HistogramVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    plotOptions: {
      series: {
        groupPadding: 0,
        pointPadding: 0,
        borderWidth: 0.5
      }
    }
  };
  readonly chartFamilyType = ChartFamilyType.Histogram;
  readonly className = VizSettingType.HistogramSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: HistogramVizSetting): HistogramVizSetting {
    return new HistogramVizSetting(obj.options);
  }
}
