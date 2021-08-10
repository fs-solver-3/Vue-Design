/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:47 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import Highcharts from 'highcharts/highmaps';
import { ThemeModule } from '@/store/modules/theme.store';
import { ChartFamilyType, VizSettingData, VizSettingType } from '@core/domain/Model';

/**
 * @deprecated from v1.0.
 */
export class DrilldownVizSetting extends VizSetting {
  static readonly DEFAULT_SETTING: Highcharts.Options = {
    yAxis: {
      gridLineWidth: 0.5,
      gridLineColor: 'var(--grid-line-color)',
      tickLength: 0
      // gridLineDashStyle: 'longdash'
    },
    xAxis: {
      lineWidth: 0.5
    },
    plotOptions: {
      series: {
        //todo trick to compile
        threshold: null as any,
        borderWidth: 0,
        dataLabels: {
          color: ThemeModule.currentTheme.textColor,
          useHTML: true,
          style: {
            border: '0px',
            textShadow: false,
            borderColor: 'none'
          }
        }
      }
    }
  };
  chartFamilyType = ChartFamilyType.Drilldown;
  className = VizSettingType.DrilldownSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: DrilldownVizSetting): DrilldownVizSetting {
    return new DrilldownVizSetting(obj.options);
  }
}
