/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:47 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';

export class HeatMapVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    boost: {
      useGPUTranslations: true
    },
    colorAxis: {
      min: null,
      minColor: '#FFAC05',
      maxColor: '#F2E8D6'
    },
    plotOptions: {
      heatmap: {
        nullColor: '#e8e8f5',
        borderWidth: 0.5
      }
    },
    yAxis: {
      tickLength: 0
    }
  };
  chartFamilyType = ChartFamilyType.HeatMap;
  className = VizSettingType.HeatMapSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: HeatMapVizSetting): HeatMapVizSetting {
    return new HeatMapVizSetting(obj.options);
  }
}
