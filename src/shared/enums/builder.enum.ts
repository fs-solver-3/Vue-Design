export enum ConditionFamilyTypes {
  dateHistogram = 'Date histogram',
  number = 'Number',
  string = 'String',
  geospatial = 'Geospatial',
  custom = 'Custom'
}

export enum DateHistogramConditionTypes {
  earlierThan = 'earlier than',
  laterThan = 'later than',
  between = 'between',
  betweenAndIncluding = 'between and including',
  lastNMinutes = 'last N minutes',
  lastNHours = 'last N hours',
  lastNDays = 'last N days',
  lastNWeeks = 'last N weeks',
  lastNMonths = 'last N months',
  lastNYears = 'last N years',
  betweenNAndMMinutesBeforeNow = 'between N and M minutes before now',
  betweenNAndMHoursBeforeNow = 'between N and M hours before now',
  betweenNAndMDaysBeforeNow = 'between N and M days before now',
  betweenNAndMWeeksBeforeNow = 'between N and M weeks before now',
  betweenNAndMMonthsBeforeNow = 'between N and M months before now',
  betweenNAndMYearsBeforeNow = 'between N and M years before now',
  currentDay = 'current day',
  currentWeek = 'current week',
  currentMonth = 'current month',
  currentQuarter = 'current quarter',
  currentYear = 'current year'
}

export enum NumberConditionTypes {
  equal = 'equal',
  notEqual = 'not equal',
  greaterThan = 'greater than',
  greaterThanOrEqual = 'greater than or equal',
  lessThan = 'less than',
  lessThanOrEqual = 'less than or equal',
  between = 'between',
  betweenAndIncluding = 'between and including',
  in = 'in',
  notIn = 'not in'
}

export enum StringConditionTypes {
  equal = 'equal',
  notEqual = 'not equal',
  oneOf = 'is one of',
  notOneOf = 'is not one of',
  isnull = 'is null',
  notNull = 'is not null',
  like = 'like',
  notLike = 'is not like',
  matchesRegex = 'matches regex',
  likeCaseInsensitive = 'like (case insensitive)',
  notLikeCaseInsensitive = 'not like (case insensitive)',
  in = 'in',
  notIn = 'not in'
}

export enum GeospatialConditionTypes {
  countryOf = 'Country of',
  cityOf = 'City of',
  stateOf = 'State of',
  districtOf = 'District of',
  longLastOf = 'Long, last of'
}

export enum SortTypes {
  Unsorted = 'Unsorted',
  AscendingOrder = 'Ascending',
  DescendingOrder = 'Descending'
}

export enum FunctionFamilyTypes {
  groupBy = 'Group By',
  dateHistogram = 'Date histogram',
  geospatial = 'Geospatial',
  aggregation = 'Aggregation',
  custom = 'Custom',
  none = 'None'
}

export enum DateFunctionTypes {
  secondOf = 'Second of',
  minuteOf = 'Minute of',
  hourOf = 'Hour of',
  dayOf = 'Day of',
  weekOf = 'Week of',
  monthOf = 'Month of',
  quarterOf = 'Quarter of',
  yearlyOf = 'Yearly of',
  hourOfDay = 'Hour of Day',
  dayOfWeek = 'Day of Week',
  dayOfMonth = 'Day of Month',
  dayOfYear = 'Day of Year',
  monthOfYear = 'Month of Year',
  year = 'Year',
  quarterOfYear = 'Quarter of Year',
  minuteOfHour = 'Minute of Hour',
  secondOfMinute = 'Second of Minute',
  weekOfMonth = 'Week of Month',
  dynamic = 'dynamic'
}

export enum GeospatialFunctionTypes {
  countryOf = 'Country of',
  cityOf = 'City of',
  stateOf = 'State of',
  districtOf = 'District of',
  longLastOf = 'Long, last of'
}

export enum AggregationFunctionTypes {
  average = 'Average',
  sum = 'Sum',
  columnRatio = 'Column ratio',
  maximum = 'Maximum',
  minimum = 'Minimum',
  countOfDistinct = 'Count of distinct',
  countAll = 'Count all',
  First = 'First',
  Last = 'Last'
}

export enum BuilderMode {
  create = 0,
  edit = 1
}

export enum BuilderType {
  chart = 0,
  filter = 1,
  unknown
}

export enum WidgetType {
  area = 'area',
  areaSpline = 'areaspline',
  bar = 'bar',
  bellCurve = 'bell_curve',
  bubble = 'bubble_chart',
  column = 'column',
  columnDrillDown = 'column_drilldown',
  barDrillDown = 'bar_drilldown',
  pieDrillDown = 'pie_drilldown',
  funnel = 'funnel',
  gauges = 'gauge',
  heatMap = 'heatmap',
  treeMap = 'tree_map',
  histogram = 'histogram',
  line = 'line',
  pareto = 'pareto',
  pie = 'pie',
  pyramid = 'pyramid',
  scatter = 'scatter',
  table = 'table',
  kpi = 'kpi',
  wordCloud = 'wordcloud',
  stackedColumn = 'stack_column',
  stackedBar = 'stack_bar',
  stackedLine = 'stack_line',
  dropdownFilter = 'dropdown_filter',
  map = 'map',
  tabFilter = 'tab_filter',
  pivotTable = 'pivot_table',
  parliament = 'parliament',
  spiderWeb = 'spider_web'
}

export enum FilterType {
  dropdown = 'dropdown'
}

export enum VizActionType {
  auto = 'auto',
  manual = 'manual'
}

export enum ZoomType {
  zoomIn,
  zoomOut
}
