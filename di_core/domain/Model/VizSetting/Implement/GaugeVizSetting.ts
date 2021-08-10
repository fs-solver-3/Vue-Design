/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:47 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { AxisSetting, ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';
import { toNumber } from 'lodash';
import { PlotOptions } from '@core/domain/Model/VizSetting/ExtraSetting/ChartStyle/PlotOptions';
export interface GaugeVizData extends VizSettingData {
  xAxis?: AxisSetting;
  yAxis?: AxisSetting;
  plotOptions?: PlotOptions;
}
export class GaugeVizSetting extends VizSetting<GaugeVizData> {
  static readonly DEFAULT_SETTING = {
    chart: {
      type: 'solidgauge',
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false
    },
    pane: {
      center: ['50%', '85%'],
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: '#DDD',
        borderWidth: 1,
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc'
      }
    },
    yAxis: {
      stops: [
        [0.1, '#34DA0B'], // green
        [0.5, '#FFAC05'], // yellow
        [0.9, '#FF5151'] // red
      ],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      title: {
        y: -70
      },
      labels: {
        y: 16
      }
    },
    plotOptions: {
      solidgauge: {
        enabled: false,
        dataLabels: {
          borderWidth: 0,
          enabled: true
        }
      },
      gauge: {
        pivot: {
          backgroundColor: 'transparent'
        },
        dial: {
          baseLength: '100%',
          radius: '105%',
          rearLength: '-50%',
          enableMouseTracking: false
        }
      }
    }
  };
  chartFamilyType = ChartFamilyType.Gauge;
  className = VizSettingType.GaugeSetting;

  constructor(options: VizSettingData = {}) {
    super({ ...options, yAxis: { ...options.yAxis, min: toNumber(options.yAxis.min) } });
  }

  static fromObject(obj: GaugeVizSetting): GaugeVizSetting {
    return new GaugeVizSetting(obj.options);
  }
}
