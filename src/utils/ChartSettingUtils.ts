/*
 * @author: tvc12 - Thien Vi
 * @created: 12/11/20, 2:33 PM
 */

import { SettingItem, TabItem } from '@/shared/models';
import {
  BellCurve2QuerySetting,
  BubbleQuerySetting,
  DrilldownQueryChartSetting,
  ScatterQuerySetting,
  SeriesQuerySetting,
  VizSetting,
  VizSettingData,
  VizSettingType
} from '@core/domain/Model';
import { SelectOption, SettingItemType, WidgetType } from '@/shared';
import { JsonUtils, Log } from '@core/utils';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { isObject } from '@core/misc/csv/record';
import { isNumber } from 'lodash';
import { SeriesOneResponse } from '@core/domain/Response';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import { ObjectUtils } from '@core/utils/ObjectUtils';
import { StringUtils } from '@/utils/string.utils';

@ClassProfiler({ prefix: 'ChartSettingUtils' })
/**
 * @deprecated from v1.0.5
 */
export class ChartSettingUtils {
  /**
   * @deprecated from v1.0.4
   * @param tabItems
   */
  static getDiSettingOptions(tabItems: TabItem[]): VizSettingData {
    let highChartOption: any = {};
    tabItems.forEach(tab => {
      tab.settingItems.forEach(setting => {
        if (setting.highchartKey) {
          const option: any = ChartSettingUtils.getOptionFromSetting(setting);
          if (option) {
            highChartOption = JsonUtils.mergeDeep(highChartOption, option);
          }
        }
      });
    });
    return this.convertToArrayIfCan(highChartOption);
  }

  /**
   * @deprecated from v1.0.5
   * @param tabItems
   */
  static toVizSettingData(valueWithSettingKey: Map<SettingKey, any>): VizSettingData {
    let rawOptions = {};
    valueWithSettingKey.forEach((value: any, key: SettingKey) => {
      const options: any = ObjectUtils.toObject(key, value);
      if (options) {
        rawOptions = JsonUtils.mergeDeep(rawOptions, options);
      }
    });
    return this.convertToArrayIfCan(rawOptions);
  }

  /**
   * @deprecated from v1.0.5
   */
  static convertToArrayIfCan(option: VizSettingData): VizSettingData {
    if (this.canNotConvertToArray(option)) {
      Object.entries(option).forEach(([key, nestedOption]) => {
        if (isObject(nestedOption)) {
          option[key] = this.convertToArrayIfCan(nestedOption);
        }
      });
      return option;
    } else {
      return this.convertToArray(option);
    }
  }

  /**
   * @deprecated from v1.0.4
   */
  static bindAxisSetting(tab: TabItem, currentData: CurrentSettingData): TabItem {
    const { setting, query } = currentData;
    switch (setting.className) {
      case VizSettingType.SeriesSetting:
      case VizSettingType.StackedSeriesSetting:
      case VizSettingType.ParetoSetting:
        this.bindSeriesAxisSetting(tab, query as SeriesQuerySetting);
        break;
      case VizSettingType.BubbleSetting:
        this.bindBubbleAxisSetting(tab, query as BubbleQuerySetting);
        break;
      case VizSettingType.DrilldownSetting:
        this.bindDrilldownAxisSetting(tab, query as DrilldownQueryChartSetting);
        break;
      case VizSettingType.BellCurveSetting:
      case VizSettingType.ScatterSetting:
        this.bindScatterAxisSetting(tab, query as ScatterQuerySetting);
        break;
      case VizSettingType.BellCurve2Setting:
        this.bindBellCurveAxisSetting(tab, query as BellCurve2QuerySetting);
    }
    return tab;
  }

  /**
   * @deprecated from v1.0.4
   */
  static bindDualAxisSetting(tab: TabItem, currentData: CurrentSettingData): TabItem {
    const { setting, response } = currentData;
    switch (setting.className) {
      case VizSettingType.SeriesSetting:
      case VizSettingType.StackedSeriesSetting:
        this.bindDualSeriesAxis(tab, response as SeriesOneResponse);
        break;
    }
    return tab;
  }

  /**
   * @deprecated from v1.0.4
   */
  static bindResponseSeriesTab(tab: TabItem, currentData: CurrentSettingData): TabItem {
    const { setting, response, widgetType } = currentData;
    switch (setting.className) {
      case VizSettingType.SeriesSetting:
      case VizSettingType.StackedSeriesSetting:
        this.bindSeriesChartSettingToSeriesTab(tab, widgetType, response as SeriesOneResponse);
        break;
    }
    return tab;
  }

  static getSettingAsMap(tabItems: TabItem[]): Map<string, SettingItem> {
    let settingAsMap: Map<string, SettingItem> = new Map();
    tabItems.forEach(tab => {
      tab.settingItems.forEach(setting => {
        if (setting.key) {
          const option: Map<string, SettingItem> | undefined = ChartSettingUtils.flatSettingAsMap(setting);
          if (option) {
            settingAsMap = new Map([...settingAsMap, ...option]);
          }
        }
      });
    });
    return settingAsMap;
  }

  /**
   * @deprecated from v1.0.4
   * @param setting
   * @private
   */
  private static getOptionFromSetting(setting: SettingItem): object | undefined {
    switch (setting.type) {
      case SettingItemType.none:
        return void 0;
      case SettingItemType.textEditor:
      case SettingItemType.group: {
        return ChartSettingUtils.getOptionFromGroupSetting(setting);
      }
      default: {
        return ObjectUtils.toObject(setting.highchartKey, setting.value);
      }
    }
  }

  private static getOptionFromGroupSetting(setting: SettingItem): any {
    let currentOption: any = ObjectUtils.toObject(setting.highchartKey, setting.value);
    // is enable
    if (setting.value) {
      setting.innerSettingItems?.forEach((innerSetting: SettingItem) => {
        if (innerSetting.highchartKey) {
          const nestedOption: object | undefined = ChartSettingUtils.getOptionFromSetting(innerSetting);
          if (nestedOption) {
            currentOption = JsonUtils.mergeDeep(currentOption, nestedOption);
          }
        }
      });
      return currentOption;
    } else {
      return currentOption;
    }
  }

  /**
   * @deprecated from v1.0.4
   */
  private static convertToArray(option: any): any[] {
    const keysSorted: number[] = Object.keys(option)
      .map(key => parseInt(key))
      .sort();
    const objectArray: any[] = [];
    keysSorted.forEach(index => {
      const currentOption = option[index];
      const newOption = isObject(currentOption) ? this.convertToArrayIfCan(currentOption) : currentOption;
      objectArray.splice(index, 0, newOption);
    });
    return objectArray;
  }

  /**
   * @deprecated from v1.0.4
   */
  private static canNotConvertToArray(option: any): boolean {
    return Object.keys(option).some(key => {
      const keyAsNumber = parseInt(key);
      return !isNumber(keyAsNumber) || isNaN(keyAsNumber);
    });
  }

  /**
   * @deprecated from v1.0.4
   */
  private static bindSeriesAxisSetting(tab: TabItem, query: SeriesQuerySetting) {
    tab.updateItem('horizontal_title', query?.xAxis?.name ?? '');
    tab.updateItem('vertical_title', query?.yAxis[0]?.name ?? '');
  }

  /**
   * @deprecated from v1.0.4
   */
  private static bindBubbleAxisSetting(tab: TabItem, query: BubbleQuerySetting) {
    tab.updateItem('horizontal_title', query?.xAxis?.name ?? '');
    tab.updateItem('vertical_title', query?.yAxis?.name ?? '');
  }

  /**
   * @deprecated from v1.0.4
   */
  private static bindDrilldownAxisSetting(tab: TabItem, query: DrilldownQueryChartSetting) {
    tab.updateItem('vertical_title', query.value?.name ?? '');
  }

  /**
   * @deprecated from v1.0.4
   */
  private static bindScatterAxisSetting(tab: TabItem, query: ScatterQuerySetting) {
    tab.updateItem('horizontal_title', query?.xAxis?.name ?? '');
    tab.updateItem('vertical_title', query?.yAxis?.name ?? '');
  }

  /**
   * @deprecated from v1.0.4
   */
  private static bindBellCurveAxisSetting(tab: TabItem, query: BellCurve2QuerySetting) {
    tab.updateItem('horizontal_title', query?.value?.name ?? '');
  }

  /**
   * @deprecated from v1.0.4
   */
  private static bindDualSeriesAxis(tab: TabItem, response: SeriesOneResponse) {
    tab.removeItem('dual_axis_selected');
    if (response.series.length > 1) {
      tab.addItems([
        new SettingItem('dual_axis_selected', 'Column to display dual axis', -1, SettingItemType.selection, 'dualAxis', [
          {
            id: -1,
            displayName: 'None'
          },
          ...response.series.map<SelectOption>((legend, index) => {
            return {
              id: index,
              displayName: legend.name
            };
          })
        ])
      ]);
    }
  }

  /**
   * @deprecated from v1.0.4
   */
  private static bindSeriesChartSettingToSeriesTab(tab: TabItem, widgetType: WidgetType, newData: SeriesOneResponse) {
    const currentLegendKeys: string[] = tab.settingItems.map(item => item.key).filter(value => value.startsWith('legend_'));
    currentLegendKeys.forEach(key => {
      tab.removeItem(key);
    });

    const legendTypes: SettingItem[] =
      newData.series?.map((legend, i) => {
        const { name } = legend;
        const type = VizSetting.CHART_TYPE_CONVERT.get(widgetType) ?? widgetType;
        const seriesLabel = StringUtils.toCamelCase(name);
        return new SettingItem(`legend_${i}`, `Display "${name}" as`, type, SettingItemType.selection, `typesByLabel.${seriesLabel}`, [
          {
            displayName: 'Line',
            id: WidgetType.line
          },
          {
            displayName: 'Column',
            id: WidgetType.column
          },
          {
            displayName: 'Bar',
            id: WidgetType.bar
          },
          {
            displayName: 'Area',
            id: WidgetType.areaSpline
          }
        ]);
      }) ?? [];
    tab?.settingItems?.push(...legendTypes);
  }
  /**
   * @deprecated from v1.0.4
   */
  private static flatSettingAsMap(setting: SettingItem): Map<string, SettingItem> | undefined {
    switch (setting.type) {
      case SettingItemType.none:
        return void 0;
      case SettingItemType.textEditor:
      case SettingItemType.group: {
        return ChartSettingUtils.flatGroupSettingItemAsMap(setting);
      }
      default: {
        return new Map([[setting.key, setting]]);
      }
    }
  }
  /**
   * @deprecated from v1.0.4
   */
  private static flatGroupSettingItemAsMap(setting: SettingItem): Map<string, SettingItem> {
    let settingAsMap = new Map<string, SettingItem>();
    settingAsMap.set(setting.key, setting);
    setting.innerSettingItems?.forEach(item => {
      const itemAsMap = this.flatSettingAsMap(item);
      if (itemAsMap) {
        settingAsMap = new Map([...settingAsMap, ...itemAsMap]);
      }
    });
    return settingAsMap;
  }
}

@ClassProfiler({ prefix: 'ChartSettingUtils2' })
export class ChartSettingUtils2 {
  static convertToObject(valueWithSettingKey: Map<SettingKey, any>): any {
    let rawOptions = {};
    const setKeyIsArray = new Set<string>();
    valueWithSettingKey.forEach((value: any, key: SettingKey) => {
      const options: any = ObjectUtils.toObject(key, value);
      if (options) {
        rawOptions = JsonUtils.mergeDeep(rawOptions, options);
      }
      const listKeyIsArray = StringUtils.findPathHasArray(key);
      ChartSettingUtils2.addKeyIsArray(setKeyIsArray, listKeyIsArray);
    });
    return ChartSettingUtils2.convertToArrayIfCan('', setKeyIsArray, rawOptions);
  }

  private static convertToArrayIfCan(parentPath: string, setKeyIsArray: Set<string>, option: any): any {
    if (ChartSettingUtils2.isNotArray(parentPath, setKeyIsArray)) {
      Object.entries(option).forEach(([key, nestedOption]) => {
        if (isObject(nestedOption)) {
          const currentPath = ChartSettingUtils2.getCurrentPath(parentPath, key);
          option[key] = ChartSettingUtils2.convertToArrayIfCan(currentPath, setKeyIsArray, nestedOption);
        }
      });
      return option;
    } else {
      return ChartSettingUtils2.convertToArray(parentPath, setKeyIsArray, option);
    }
  }

  private static convertNestedOptionToArray(parentPath: string, setKeyIsArray: Set<string>, option: any) {
    if (isObject(option)) {
      Object.entries(option).forEach(([key, nestedOption]) => {
        if (isObject(nestedOption)) {
          const currentPath = ChartSettingUtils2.getCurrentPath(parentPath, key);
          option[key] = ChartSettingUtils2.convertToArrayIfCan(currentPath, setKeyIsArray, nestedOption);
        }
      });
    }
    return option;
  }

  private static isNotArray(parentPath: string, setKeyIsArray: Set<string>): boolean {
    return !setKeyIsArray.has(parentPath);
  }

  private static convertToArray(parentPath: string, setKeyIsArray: Set<string>, option: any): any[] {
    const keysSorted: number[] = Object.keys(option)
      .map(key => parseInt(key))
      .sort();
    const listData: any[] = [];
    keysSorted.forEach(index => {
      const currentOption = option[index];
      const newOption = ChartSettingUtils2.convertNestedOptionToArray(parentPath, setKeyIsArray, currentOption);
      listData.splice(index, 0, newOption);
    });
    return listData;
  }

  private static addKeyIsArray(setKeyIsArray: Set<string>, keys: string[]): void {
    keys.forEach(key => setKeyIsArray.add(key));
  }

  private static getCurrentPath(parentPath: string, key: string): string {
    if (parentPath) {
      return StringUtils.buildPath(parentPath, key);
    } else {
      return key;
    }
  }
}
