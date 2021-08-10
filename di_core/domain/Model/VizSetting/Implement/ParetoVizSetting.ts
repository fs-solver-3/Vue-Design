/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:46 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';
import { MapUtils } from '@/utils';
import { cloneDeep } from 'lodash';
const deleteProperty = Reflect.deleteProperty;

export class ParetoVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    yAxis: [
      {
        gridLineWidth: 0.5,
        gridLineColor: 'var(--grid-line-color)',
        tickLength: 0
        // gridLineDashStyle: 'longdash'
      },
      {
        gridLineWidth: 0.5,
        tickLength: 0,
        gridLineColor: 'var(--grid-line-color)'
        // gridLineDashStyle: 'longdash'
      }
    ],
    // xAxis: [
    //   {
    //     gridLineWidth: 0
    //     // gridLineColor: '#ffffffbb',
    //     // gridLineDashStyle: 'longdash'
    //   }
    // ],
    plotOptions: {
      series: {
        borderWidth: 0,
        borderColor: 'black'
      }
    }
  };
  chartFamilyType = ChartFamilyType.Pareto;
  className = VizSettingType.ParetoSetting;
  baseTypes: Record<string, number>;

  constructor(options: VizSettingData = {}, baseTypes: {} = {}) {
    super(options);
    this.baseTypes = MapUtils.isNotEmpty(baseTypes) ? baseTypes : this.toBaseTypes(options);
    // if (options.yAxis && options.yAxis[0]) {
    //   const yAxis: any[] = options.yAxis as any[];
    //   const dualAxis: any = cloneDeep(yAxis[0]);
    //   dualAxis.opposite = true;
    //   options.yAxis[1] = dualAxis;
    // }
  }

  static fromObject(obj: ParetoVizSetting): ParetoVizSetting {
    return new ParetoVizSetting(obj.options, obj.baseTypes);
  }

  private toBaseTypes(options: Record<string, any>): Record<string, number> {
    if (options.baseTypes != undefined) {
      return {
        pareto: +options.baseTypes
      };
    }
    return {};
  }
}
