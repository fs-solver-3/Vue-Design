import { BaseModule, DIKeys } from '@core/modules';
import { Container, Scope } from 'typescript-ioc';
import { WidgetType } from '@/shared';
import {
  BellCurveQuerySettingHandler,
  BellCurveVizSettingHandler,
  BubbleQuerySettingHandler,
  BubbleVizSettingHandler,
  DrilldownPieQuerySettingHandler,
  DrilldownPieVizSettingHandler,
  DrilldownQuerySettingHandler,
  DrilldownVizSettingHandler,
  DropDownFilterQuerySettingHandler,
  DropdownVizSettingHandler,
  FunnelQuerySettingHandler,
  FunnelVizSettingHandler,
  GaugeQuerySettingHandler,
  GaugeVizSettingHandler,
  HeatMapQuerySettingHandler,
  HeatMapVizSettingHandler,
  HistogramQuerySettingHandler,
  HistogramVizSettingHandler,
  MapQuerySettingHandler,
  MapVizHandler,
  NumberQuerySettingHandler,
  NumberVizSettingHandler,
  PanelSettingResolver,
  PanelSettingResolverBuilder,
  ParetoQuerySettingHandler,
  ParetoVizSettingHandler,
  ParliamentPanelHandler,
  ParliamentQuerySettingHandler,
  ParliamentVizSettingHandler,
  PieQuerySettingHandler,
  PieVizSettingHandler,
  PivotQuerySettingHandler,
  PivotTableSettingHandler,
  PyramidQuerySettingHandler,
  PyramidVizSettingHandler,
  ScatterQuerySettingHandler,
  ScatterVizSettingHandler,
  SeriesQuerySettingHandler,
  SeriesVizSettingHandler,
  SpiderWebVizSettingHandler,
  SpyderWebQuerySettingHandler,
  StackedVizSettingHandler,
  StackingSeriesQuerySettingHandler,
  TabFilterQuerySettingHandler,
  TabFilterVizSettingHandler,
  TableQuerySettingHandler,
  TableVizSettingHandler,
  TreeMapQuerySettingHandler,
  TreeMapVizSettingHandler,
  VizSettingResolver,
  VizSettingResolverBuilder,
  WordCloudQuerySettingHandler,
  WordCloudVizSettingHandler
} from '@/shared/Resolver';
import {
  CompareBuilder,
  DashboardSettingVersionBuilder,
  DashboardSettingVersionResolver,
  DefaultDashboardSettingConvertor,
  NumberCompareBuilder,
  SeriesCompareBuilder
} from '@core/services';
import { VizSettingType } from '@core/domain/Model';
import { DefaultRenderProcessService, RenderProcessService } from '@chart/custom/RenderProcessService';
import { PageRenderService, PageRenderServiceImpl } from '@chart/custom/PageRenderService';
import { BodyHTMLRender } from '@chart/custom/render/HTMLRender';
import { CssRenderImpl } from '@chart/custom/render/CSSRender';
import { JSRenderImpl } from '@chart/custom/render/JSRender';
import { Log } from '@core/utils';
import { SeriesPanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/SeriesPanelHandler';
import { StackingPanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/StackingPanelHandler';
import { DrilldownPanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/DrilldownPanelHandler';
import { ParetoPanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/ParetoPanelHandler';
import { BellCurvePanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/BellCurvePanelHandler';
import { TreeMapPanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/TreeMapPanelHandler';
import { BubblePanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/BubblePanelHandler';
import { HistogramPanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/HistogramPanelHandler';
import { MapPanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/MapPanelHandler';
import { FunctionConvertResolver } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/FunctionConvertResolver';
import { BubbleFunctionConvertor } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/BubbleFunctionConvertor';
import { FunctionConvertBuilder } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/FunctionConvertBuilder';
import { ScatterFunctionConvertor } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/ScatterFunctionConvertor';
import { PivotPanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/PivotPanelHandler';
import { TablePanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/TablePanelHandler';
import { ScatterPanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/Implement/ScatterPanelHandler';
import { TableFunctionConvertor } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionConvertor/TableFunctionConvertor';
import { QuerySettingResolver } from '@/shared/Resolver/QuerySettingResolver/QuerySettingResolver';
import { QuerySettingResolverBuilder } from '@/shared/Resolver/QuerySettingResolver/QuerySettingResolverBuilder';
import { PieBlocCreator, SettingBlocBuilder, SettingBlocResolver, TableSettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { PivotTableSettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc/SettingBlocCreator/PivotTableBlocCreator';
import { SeriesSettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc/SettingBlocCreator/SeriesBlocCreator';
import { BubbleSettingBlocCreator } from '@/shared/Settings/BubbleSetting';
import { ParetoSettingBlocCreator } from '@/shared/Settings/ParetoSetting';
import { ScatterSettingBlocCreator } from '@/shared/Settings/ScatterSetting';
import { BellCurveSettingBlocCreator } from '@/shared/Settings/BellCurveSetting';
import { GaugeSettingBlocCreator } from '@/shared/Settings/GaugeSetting';
import { WordCloudSettingBlocCreator } from '@/shared/Settings/WordCloudSetting';
import { TreeMapSettingBlocCreator } from '@/shared/Settings/TreeMapSetting';
import { StackSeriesSettingBlocCreator } from '@/shared/Settings/StackChart';
import { PyramidSettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc/SettingBlocCreator/PyramidBlocCreator';
import { FunnelSettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc/SettingBlocCreator/FunnelBlocCreator';
import { NumberBlocCreator } from '@/shared/Settings/NumberSetting';
import { HistogramSettingBlocCreator } from '@/shared/Settings/HistogramSetting';
import { SpiderSettingBlocCreator } from '@/shared/Settings/SpiderSetting';
import { TabFilterSettingBlocCreator } from '@/shared/Settings/TabFilterSetting';
import { HeatMapSettingBlocCreator } from '@/shared/Settings/HeatMapSetting/HeatMapSettingBlocCreator';
import { MapSettingBlocCreator } from '@/shared/Settings/MapSetting';
import { ParliamentSettingBlocCreator } from '@/shared/Settings/ParliamentSetting';

export class ChartBuilderModule implements BaseModule {
  configuration(): void {
    this.bindSettingBuilder();
    this.bindQueryBuilder();
    this.bindCompareResolver();
    this.bindPanelSettingBuilder();
    this.bindCustomRenderService();
    this.bindFunctionConvertResolver();
    this.bindDashboardSettingVersionResolver();
    this.bindSettingBlocResolver();
  }

  private bindQueryBuilder(): void {
    const seriesHandler = new SeriesQuerySettingHandler();
    const stackingHandler = new StackingSeriesQuerySettingHandler();
    const drilldownHandler = new DrilldownQuerySettingHandler();
    const tableHandler = new TableQuerySettingHandler();
    const builder: QuerySettingResolver = new QuerySettingResolverBuilder()
      .add(WidgetType.line, seriesHandler)
      .add(WidgetType.area, seriesHandler)
      .add(WidgetType.bar, seriesHandler)
      .add(WidgetType.column, seriesHandler)
      .add(WidgetType.pie, new PieQuerySettingHandler())
      .add(WidgetType.funnel, new FunnelQuerySettingHandler())
      .add(WidgetType.pyramid, new PyramidQuerySettingHandler())
      .add(WidgetType.scatter, new ScatterQuerySettingHandler())
      .add(WidgetType.bubble, new BubbleQuerySettingHandler())
      .add(WidgetType.pareto, new ParetoQuerySettingHandler())
      .add(WidgetType.bellCurve, new BellCurveQuerySettingHandler())
      .add(WidgetType.heatMap, new HeatMapQuerySettingHandler())
      .add(WidgetType.gauges, new GaugeQuerySettingHandler())
      .add(WidgetType.kpi, new NumberQuerySettingHandler())
      .add(WidgetType.barDrillDown, drilldownHandler)
      .add(WidgetType.columnDrillDown, drilldownHandler)
      .add(WidgetType.pieDrillDown, new DrilldownPieQuerySettingHandler())
      .add(WidgetType.table, tableHandler)
      .add(WidgetType.wordCloud, new WordCloudQuerySettingHandler())
      .add(WidgetType.treeMap, new TreeMapQuerySettingHandler())
      .add(WidgetType.stackedBar, stackingHandler)
      .add(WidgetType.stackedColumn, stackingHandler)
      .add(WidgetType.stackedLine, stackingHandler)
      .add(WidgetType.histogram, new HistogramQuerySettingHandler())
      .add(WidgetType.dropdownFilter, new DropDownFilterQuerySettingHandler())
      .add(WidgetType.map, new MapQuerySettingHandler())
      .add(WidgetType.tabFilter, new TabFilterQuerySettingHandler())
      .add(WidgetType.pivotTable, new PivotQuerySettingHandler())
      .add(WidgetType.parliament, new ParliamentQuerySettingHandler())
      .add(WidgetType.spiderWeb, new SpyderWebQuerySettingHandler())
      .build();
    Container.bind(QuerySettingResolver)
      .factory(() => builder)
      .scope(Scope.Singleton);
  }

  private bindSettingBuilder(): void {
    const settingHandler = new SeriesVizSettingHandler();
    const stackHandler = new StackedVizSettingHandler();
    const drilldownHandler = new DrilldownVizSettingHandler();
    const tableHandler = new TableVizSettingHandler();
    const builder = new VizSettingResolverBuilder()
      .add(WidgetType.line, settingHandler)
      .add(WidgetType.area, settingHandler)
      .add(WidgetType.bar, settingHandler)
      .add(WidgetType.column, settingHandler)
      .add(WidgetType.pie, new PieVizSettingHandler())
      .add(WidgetType.funnel, new FunnelVizSettingHandler())
      .add(WidgetType.pyramid, new PyramidVizSettingHandler())
      .add(WidgetType.scatter, new ScatterVizSettingHandler())
      .add(WidgetType.bubble, new BubbleVizSettingHandler())
      .add(WidgetType.pareto, new ParetoVizSettingHandler())
      .add(WidgetType.heatMap, new HeatMapVizSettingHandler())
      .add(WidgetType.gauges, new GaugeVizSettingHandler())
      .add(WidgetType.kpi, new NumberVizSettingHandler())
      .add(WidgetType.columnDrillDown, drilldownHandler)
      .add(WidgetType.barDrillDown, drilldownHandler)
      .add(WidgetType.pieDrillDown, new DrilldownPieVizSettingHandler())
      .add(WidgetType.table, tableHandler)
      .add(WidgetType.wordCloud, new WordCloudVizSettingHandler())
      .add(WidgetType.bellCurve, new BellCurveVizSettingHandler())
      .add(WidgetType.treeMap, new TreeMapVizSettingHandler())
      .add(WidgetType.stackedBar, stackHandler)
      .add(WidgetType.stackedColumn, stackHandler)
      .add(WidgetType.stackedLine, stackHandler)
      .add(WidgetType.histogram, new HistogramVizSettingHandler())
      .add(WidgetType.dropdownFilter, new DropdownVizSettingHandler())
      .add(WidgetType.tabFilter, new TabFilterVizSettingHandler())
      .add(WidgetType.map, new MapVizHandler())
      .add(WidgetType.pivotTable, new PivotTableSettingHandler())
      .add(WidgetType.parliament, new ParliamentVizSettingHandler())
      .add(WidgetType.spiderWeb, new SpiderWebVizSettingHandler())
      .build();
    Container.bind(VizSettingResolver)
      .factory(() => builder)
      .scope(Scope.Singleton);
  }

  private bindCompareResolver() {
    const builders = new Map<VizSettingType, CompareBuilder>();
    builders.set(VizSettingType.NumberSetting, new NumberCompareBuilder()).set(VizSettingType.SeriesSetting, new SeriesCompareBuilder());
    Container.bindName(DIKeys.compareBuilder).to(builders);
  }

  private bindPanelSettingBuilder() {
    const seriesHandler = new SeriesPanelHandler();
    const stackHandler = new StackingPanelHandler();
    const drillDownHandler = new DrilldownPanelHandler();
    const builder = new PanelSettingResolverBuilder()
      .add(WidgetType.line, seriesHandler)
      .add(WidgetType.area, seriesHandler)
      .add(WidgetType.bar, seriesHandler)
      .add(WidgetType.column, seriesHandler)
      .add(WidgetType.stackedBar, stackHandler)
      .add(WidgetType.stackedColumn, stackHandler)
      .add(WidgetType.stackedLine, stackHandler)
      .add(WidgetType.pareto, new ParetoPanelHandler())
      .add(WidgetType.columnDrillDown, drillDownHandler)
      .add(WidgetType.barDrillDown, drillDownHandler)
      .add(WidgetType.bellCurve, new BellCurvePanelHandler())
      .add(WidgetType.scatter, new ScatterPanelHandler())
      .add(WidgetType.treeMap, new TreeMapPanelHandler())
      .add(WidgetType.map, new MapPanelHandler())
      .add(WidgetType.histogram, new HistogramPanelHandler())
      .add(WidgetType.bubble, new BubblePanelHandler())
      .add(WidgetType.pivotTable, new PivotPanelHandler())
      .add(WidgetType.table, new TablePanelHandler())
      .add(WidgetType.parliament, new ParliamentPanelHandler())
      .build();
    Log.debug('bindPanelSettingBuilder:: panel handler', builder);
    Container.bind(PanelSettingResolver)
      .factory(() => builder)
      .scope(Scope.Singleton);
  }

  private bindCustomRenderService(): void {
    Container.bind(RenderProcessService)
      .factory(() => new DefaultRenderProcessService())
      .scope(Scope.Singleton);
    Container.bind(PageRenderService)
      .factory(() => new PageRenderServiceImpl(new BodyHTMLRender(), new CssRenderImpl(), new JSRenderImpl()))
      .scope(Scope.Singleton);
  }

  private bindFunctionConvertResolver() {
    const resolver = new FunctionConvertBuilder()
      .add(WidgetType.table, new TableFunctionConvertor())
      .add(WidgetType.bubble, new BubbleFunctionConvertor())
      .add(WidgetType.scatter, new ScatterFunctionConvertor())
      .build();
    Container.bind(FunctionConvertResolver)
      .factory(() => resolver)
      .scope(Scope.Singleton);
  }

  private bindDashboardSettingVersionResolver() {
    const resolver = new DashboardSettingVersionBuilder().add(new DefaultDashboardSettingConvertor()).build();
    Container.bind(DashboardSettingVersionResolver)
      .factory(() => resolver)
      .scope(Scope.Singleton);
  }

  private bindSettingBlocResolver() {
    const seriesBlocCreator = new SeriesSettingBlocCreator();
    const stackBlocCreator = new StackSeriesSettingBlocCreator();
    const settingBlocResolver = new SettingBlocBuilder()
      .add(WidgetType.table, new TableSettingBlocCreator())
      .add(WidgetType.pivotTable, new PivotTableSettingBlocCreator())
      .add(WidgetType.line, seriesBlocCreator)
      .add(WidgetType.column, seriesBlocCreator)
      .add(WidgetType.area, seriesBlocCreator)
      .add(WidgetType.bar, seriesBlocCreator)
      .add(WidgetType.scatter, new ScatterSettingBlocCreator())
      .add(WidgetType.bubble, new BubbleSettingBlocCreator())
      .add(WidgetType.pareto, new ParetoSettingBlocCreator())
      .add(WidgetType.bellCurve, new BellCurveSettingBlocCreator())
      .add(WidgetType.gauges, new GaugeSettingBlocCreator())
      .add(WidgetType.wordCloud, new WordCloudSettingBlocCreator())
      .add(WidgetType.treeMap, new TreeMapSettingBlocCreator())
      .add(WidgetType.stackedColumn, stackBlocCreator)
      .add(WidgetType.stackedBar, stackBlocCreator)
      .add(WidgetType.funnel, new FunnelSettingBlocCreator())
      .add(WidgetType.pie, new PieBlocCreator())
      .add(WidgetType.pyramid, new PyramidSettingBlocCreator())
      .add(WidgetType.kpi, new NumberBlocCreator())
      .add(WidgetType.histogram, new HistogramSettingBlocCreator())
      .add(WidgetType.spiderWeb, new SpiderSettingBlocCreator())
      .add(WidgetType.tabFilter, new TabFilterSettingBlocCreator())
      .add(WidgetType.heatMap, new HeatMapSettingBlocCreator())
      .add(WidgetType.map, new MapSettingBlocCreator())
      .add(WidgetType.parliament, new ParliamentSettingBlocCreator())
      .build();
    Container.bind(SettingBlocResolver)
      .factory(() => settingBlocResolver)
      .scope(Scope.Singleton);
  }
}
