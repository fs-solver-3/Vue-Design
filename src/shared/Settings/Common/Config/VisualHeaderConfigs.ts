import { WidgetType } from '@/shared';

export class VisualHeaderConfigs {
  static readonly drilldownWidgets: Set<WidgetType> = new Set([
    // WidgetType.funnel,
    WidgetType.pareto,
    WidgetType.pyramid,
    WidgetType.pie,
    WidgetType.bar,
    WidgetType.column,
    WidgetType.line,
    WidgetType.area,
    WidgetType.wordCloud,
    WidgetType.spiderWeb,
    WidgetType.stackedBar,
    WidgetType.stackedColumn,
    WidgetType.parliament
  ]);
  static readonly zoomWidgets: Set<WidgetType> = new Set<WidgetType>([
    WidgetType.bellCurve,
    WidgetType.funnel,
    WidgetType.pareto,
    WidgetType.pie,
    WidgetType.scatter,
    WidgetType.bar,
    WidgetType.column,
    WidgetType.line,
    WidgetType.area,
    WidgetType.spiderWeb,
    WidgetType.stackedBar,
    WidgetType.stackedColumn
  ]);
}
