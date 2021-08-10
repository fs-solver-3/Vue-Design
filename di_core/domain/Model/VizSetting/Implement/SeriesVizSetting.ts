/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:46 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { AxisSetting, ChartFamilyType, LabelsSetting, LegendSetting, MapNavigation, VizSettingData, VizSettingType } from '@core/domain/Model';
import { StringUtils } from '@/utils/string.utils';
import { cloneDeep, merge } from 'lodash';
import { ObjectUtils } from '@core/utils/ObjectUtils';
import { PlotOptions } from '@core/domain/Model/VizSetting/ExtraSetting/ChartStyle/PlotOptions';
import { ChartTooltipSetting } from '@core/domain/Model/VizSetting/ExtraSetting/ChartStyle/ChartTooltipSetting';

const deleteProperty = Reflect.deleteProperty;

export interface ColorAxis {
  maxColor?: string;
  minColor?: string;
  noneColor?: string;
  labels?: LabelsSetting;
}

export interface ThemeColor {
  enabled?: boolean;
  colors?: string[];
}

export interface SeriesVizData extends VizSettingData {
  legend?: LegendSetting;
  xAxis?: AxisSetting[];
  yAxis?: AxisSetting[];
  colors?: string[];
  colorAxis?: ColorAxis;
  plotOptions?: PlotOptions;
  tooltip?: ChartTooltipSetting;
  mapNavigation?: MapNavigation;
}

export class SeriesVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {
    tooltip: {
      shared: true,
      headerFormat: '<span style="font-size: 15px">{point.point.name}</span><br/>',
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
    },
    yAxis: [
      {
        // gridLineWidth: 0.5,
        // gridLineColor: 'var(--grid-line-color)',
        tickLength: 0,
        opposite: false,
        tickAmount: undefined
        // gridLineColor: '#ffffffbb',
        // gridLineDashStyle: 'longdash'
      },
      {
        tickLength: 0,
        opposite: true,
        tickAmount: undefined,
        title: {
          text: ''
        }
      }
    ],
    xAxis: {
      lineWidth: 0.5,
      lineColor: 'var(--grid-line-color)'
      // gridLineDashStyle: 'longdash'
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        borderColor: 'black',
        // threshold: null,
        dataLabels: {
          borderWidth: 0,
          textOutline: '0px contrast',
          useHTML: true,
          style: {
            border: '0px',
            borderColor: 'none',
            textShadow: false
          }
        },
        label: {
          enabled: false
        }
      }
    }
  };

  chartFamilyType = ChartFamilyType.Series;
  className = VizSettingType.SeriesSetting;

  /**
   * @key: label (Online, Offline)
   * @value: group (stack_group_0, stack_group_1)
   */
  stackingGroup: Map<string, string>;
  /**
   * @seriesTypeByLabelMap will replace @seriesTypes
   * @key: label (Online, Offline)
   * @value: chartType (line, column)
   */
  seriesTypesByLabelMap: Map<string, string>;

  constructor(options: SeriesVizData) {
    super(options);
    options = this.toSeriesOptions(options);
    this.stackingGroup = this.toStackingGroup(options || {});
    this.seriesTypesByLabelMap = this.toSeriesTypeByLabelMap(options || {});
  }

  static fromObject(obj: SeriesVizSetting): SeriesVizSetting {
    return new SeriesVizSetting(obj.options);
  }

  private toStackingGroup(options: Record<string, any>): Map<string, string> {
    const stackingGroup: Map<string, string> = new Map();
    if (options.stackingGroup) {
      for (const key in options.stackingGroup) {
        const group = options.stackingGroup[`${key}`];
        stackingGroup.set(StringUtils.toCamelCase(key), group);
      }
    }
    return stackingGroup;
  }

  private toSeriesOptions(options: SeriesVizData): SeriesVizData {
    const result = {
      ...options
    };
    const haveDualAxis: boolean = result.dualAxis != undefined && result.dualAxis != -1;
    // @ts-ignore
    const noneStacking = result.plotOptions?.series?.stacking == 'none';
    const haveStackPercentage: boolean = result.plotOptions?.series?.stacking == 'percent';
    if (haveDualAxis && (result.yAxis as any[]).length < 2) {
      const yAxis: any[] = result.yAxis as any[];
      const dualAxis: any = cloneDeep(yAxis[0]);
      dualAxis.opposite = true;
      dualAxis.id = 'dual-axis';
      deleteProperty(dualAxis, 'title');
      // @ts-ignore
      result.yAxis[1] = dualAxis;
    }
    if (noneStacking) {
      // @ts-ignore
      result.plotOptions.series.stacking = undefined;
    } else if (haveStackPercentage) {
      const plotOptions = ObjectUtils.toObject('plotOptions.series.threshold', 0);
      merge(result, plotOptions);
    }
    return result;
  }

  private toSeriesTypeByLabelMap(options: Record<string, any>): Map<string, string> {
    const seriesTypeByLabelMap: Map<string, string> = new Map();
    if (options.typesByLabel) {
      for (const key in options.typesByLabel) {
        let type = options.typesByLabel[`${key}`];
        type = VizSetting.CHART_TYPE_CONVERT.get(type) ?? type;
        seriesTypeByLabelMap.set(StringUtils.toCamelCase(key), type);
      }
    }
    return seriesTypeByLabelMap;
  }
}
