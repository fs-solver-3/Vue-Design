import { WidgetType } from '@/shared';

export const DefaultHtml = `<!-- Can be render with Mustache.js and styled with bootstrap -->
<div id="custom-chart" class="h-100 w-100"></div>
`;

export const CustomTableHtml = DefaultHtml;
export const CustomLineChartHtml = DefaultHtml;
export const CustomColumnChartHtml = DefaultHtml;
export const CustomBarChartHtml = DefaultHtml;
export const CustomAreaChartHtml = DefaultHtml;

export const CustomNumberHtml = `<!-- Can be render with Mustache.js and styled with bootstrap -->
<div id="custom-chart" class="number-container w-100 h-100 d-flex flex-column align-items-center justify-content-center">
</div>`;

export const CustomHtmlAsMap = new Map<WidgetType, string>([
  [WidgetType.table, CustomTableHtml],
  [WidgetType.line, CustomLineChartHtml],
  [WidgetType.column, CustomColumnChartHtml],
  [WidgetType.bar, CustomBarChartHtml],
  [WidgetType.area, CustomAreaChartHtml],
  [WidgetType.kpi, CustomNumberHtml]
]);
