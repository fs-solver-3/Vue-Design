/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:47 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';
import { MapUtils } from '@/utils';
import { cloneDeep, toNumber } from 'lodash';

const deleteProperty = Reflect.deleteProperty;

export class BellCurveVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    plotOptions: {
      series: {
        label: {
          enabled: false
        }
      }
    },
    yAxis: [
      {
        gridLineWidth: 0.5,
        gridLineColor: 'var(--grid-line-color)',
        tickLength: 0
        // gridLineDashStyle: 'longdash'
      },
      {
        gridLineWidth: 0.5,
        gridLineColor: 'var(--grid-line-color)',
        tickLength: 0
        // gridLineDashStyle: 'longdash'
      }
    ],
    xAxis: [
      {
        gridLineWidth: 0
        // gridLineColor: '#ffffffbb',
        // gridLineDashStyle: 'longdash'
      }
    ]
  };
  chartFamilyType = ChartFamilyType.BellCurve;
  className = VizSettingType.BellCurveSetting;
  baseTypes: Record<string, number>;

  constructor(options: VizSettingData = {}, baseTypes: {} = {}) {
    super(options);
    this.baseTypes = MapUtils.isNotEmpty(baseTypes) ? baseTypes : this.toBaseTypes(options);
    const yAxis: any[] = options.yAxis as any[];
    const dualAxis: any = cloneDeep(yAxis[0]);
    dualAxis.opposite = true;
    deleteProperty(dualAxis, 'title');
    options.yAxis[1] = dualAxis;
  }

  static fromObject(obj: BellCurveVizSetting): BellCurveVizSetting {
    return new BellCurveVizSetting(obj.options, obj.baseTypes);
  }

  private toBaseTypes(options: Record<string, any>): Record<string, number> {
    if (options.baseTypes != undefined) {
      return {
        bellCurve: +options.baseTypes
      };
    }
    return {};
  }
}

export class BellCurve2VizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    plotOptions: {
      series: {
        label: {
          enabled: false
        }
      }
    },
    yAxis: [
      {
        gridLineWidth: 0.5,
        gridLineColor: 'var(--grid-line-color)',
        tickLength: 0
        // gridLineDashStyle: 'longdash'
      },
      {
        gridLineWidth: 0.5,
        gridLineColor: 'var(--grid-line-color)',
        tickLength: 0
        // gridLineDashStyle: 'longdash'
      }
    ],
    xAxis: [
      {
        gridLineWidth: 0
        // gridLineColor: '#ffffffbb',
        // gridLineDashStyle: 'longdash'
      }
    ]
  };
  chartFamilyType = ChartFamilyType.BellCurve;
  className = VizSettingType.BellCurve2Setting;
  baseTypes: Record<string, number>;

  constructor(options: VizSettingData = {}, baseTypes: {} = {}) {
    super(options);
    this.baseTypes = MapUtils.isNotEmpty(baseTypes) ? baseTypes : this.toBaseTypes(options);
    const yAxis: any[] = options.yAxis as any[];
    const dualAxis: any = cloneDeep(yAxis[0]);
    dualAxis.opposite = true;
    deleteProperty(dualAxis, 'title');
    options.yAxis[1] = dualAxis;
  }

  static fromObject(obj: BellCurve2VizSetting): BellCurve2VizSetting {
    return new BellCurve2VizSetting(obj.options, obj.baseTypes);
  }

  private toBaseTypes(options: Record<string, any>): Record<string, number> {
    if (options.baseTypes != undefined) {
      return {
        bellCurve: +options.baseTypes
      };
    }
    return {};
  }

  getNumDataPoint(): number | undefined {
    const numDataPoint: number = toNumber(this.options.numDataPoint);
    return isNaN(numDataPoint) ? void 0 : numDataPoint;
  }
}
