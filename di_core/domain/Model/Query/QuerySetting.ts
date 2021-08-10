/*
 * @author: tvc12 - Thien Vi
 * @created: 11/26/20, 6:47 PM
 */

import {
  BellCurveQuerySetting,
  BubbleQuerySetting,
  Condition,
  DrilldownQueryChartSetting,
  DropdownQuerySetting,
  Function,
  FunnelQuerySetting,
  GaugeQuerySetting,
  GroupedTableQuerySetting,
  HeatMapQuerySetting,
  HistogramQuerySetting,
  MapQuerySetting,
  NumberQuerySetting,
  OrderBy,
  ParliamentQuerySetting,
  ParetoQuerySetting,
  PieQuerySetting,
  PivotTableQuerySetting,
  PyramidQuerySetting,
  QuerySettingType,
  ScatterQuerySetting,
  SeriesQuerySetting,
  StackedQuerySetting,
  TabFilterQuerySetting,
  TableQueryChartSetting,
  TreeMapQuerySetting,
  VizSetting,
  VizSettingType,
  WordCloudQuerySetting,
  SpiderWebQuerySetting,
  BellCurve2QuerySetting,
  TableColumn
} from '@core/domain/Model';
import { Log } from '@core/utils';

export const getFiltersAndSorts: (obj: QuerySetting) => [Condition[], OrderBy[]] = (obj: QuerySetting): [Condition[], OrderBy[]] => {
  const filters: Condition[] = obj.filters?.map(filter => Condition.fromObject(filter)) ?? [];
  const sorts = obj.sorts?.map(sort => OrderBy.fromObject(sort)) ?? [];
  return [filters, sorts];
};

export abstract class QuerySetting<T extends VizSetting = VizSetting> {
  abstract className: QuerySettingType;

  protected constructor(public filters: Condition[], public sorts: OrderBy[], public options: Record<string, any>) {}

  static fromObject(obj: QuerySetting): QuerySetting | undefined {
    // return new PreviewChartRequest(filters, sorts);
    switch (obj.className) {
      case QuerySettingType.GroupedTable:
        return GroupedTableQuerySetting.fromObject(obj);
      case QuerySettingType.Table:
        return TableQueryChartSetting.fromObject(obj);
      case QuerySettingType.Pie:
        return PieQuerySetting.fromObject(obj as PieQuerySetting);
      case QuerySettingType.Funnel:
        return FunnelQuerySetting.fromObject(obj as FunnelQuerySetting);
      case QuerySettingType.Pyramid:
        return PyramidQuerySetting.fromObject(obj as PyramidQuerySetting);
      case QuerySettingType.Series:
        return QuerySetting.fromObjectWithSettingType(obj);
      // Scatter or bell is not different
      case QuerySettingType.Scatter:
        return QuerySetting.fromObjectWithSettingType(obj);
      case QuerySettingType.Bubble:
        return BubbleQuerySetting.fromObject(obj as BubbleQuerySetting);
      case QuerySettingType.HeatMap:
        return HeatMapQuerySetting.fromObject(obj as HeatMapQuerySetting);
      case QuerySettingType.Gauge:
        return GaugeQuerySetting.fromObject(obj as GaugeQuerySetting);
      case QuerySettingType.Number:
        return NumberQuerySetting.fromObject(obj as NumberQuerySetting);
      case QuerySettingType.Drilldown:
        return DrilldownQueryChartSetting.fromObject(obj as DrilldownQueryChartSetting);
      case QuerySettingType.WordCloud:
        return WordCloudQuerySetting.fromObject(obj as WordCloudQuerySetting);
      case QuerySettingType.TreeMap:
        return TreeMapQuerySetting.fromObject(obj as TreeMapQuerySetting);
      case QuerySettingType.Histogram:
        return HistogramQuerySetting.fromObject(obj as HistogramQuerySetting);
      case QuerySettingType.Dropdown:
        return DropdownQuerySetting.fromObject(obj as DropdownQuerySetting);
      case QuerySettingType.Map:
        return MapQuerySetting.fromObject(obj as MapQuerySetting);
      case QuerySettingType.TabFilter:
        return TabFilterQuerySetting.fromObject(obj as TabFilterQuerySetting);
      case QuerySettingType.PivotTable:
        return PivotTableQuerySetting.fromObject(obj);
      case QuerySettingType.Parliament:
        return ParliamentQuerySetting.fromObject(obj);
      case QuerySettingType.SpiderWeb:
        return SpiderWebQuerySetting.fromObject(obj as SpiderWebQuerySetting);
      case QuerySettingType.BellCurve:
        return BellCurve2QuerySetting.fromObject(obj as BellCurve2QuerySetting);
      default:
        Log.info(`QuerySetting:: ${obj.className} unsupported`);
        return void 0;
    }
  }

  private static fromObjectWithSettingType(obj: any | QuerySetting): QuerySetting | undefined {
    if (obj.options) {
      switch (obj.options.className) {
        case VizSettingType.BellCurveSetting:
          return BellCurveQuerySetting.fromObject(obj);
        case VizSettingType.ScatterSetting:
          return ScatterQuerySetting.fromObject(obj);
        case VizSettingType.SeriesSetting:
          return SeriesQuerySetting.fromObject(obj);
        case VizSettingType.StackedSeriesSetting:
          return StackedQuerySetting.fromObject(obj);
        case VizSettingType.ParetoSetting:
          return ParetoQuerySetting.fromObject(obj);
      }
    }
    return void 0;
  }

  abstract getAllFunction(): Function[];

  getVisualizationSetting(): T | undefined {
    return this.options?.className ? (VizSetting.fromObject(this.options as any) as T) : void 0;
  }

  setVisualizationSetting(vizSetting: VizSetting): void {
    // function assign or merge is working
    const options: any = Object.assign({}, vizSetting);
    this.options = options;
    try {
      const finalVizSetting = VizSetting.fromObject(options);
      if (finalVizSetting) {
        this.setValueBySetting(finalVizSetting);
      }
    } catch (ex) {
      Log.debug('setVisualizationSetting::ex', ex);
    }
  }

  protected setValueBySetting(setting: VizSetting) {
    //Nothing to do
  }
}
