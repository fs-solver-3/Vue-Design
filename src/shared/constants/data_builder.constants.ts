import {
  AggregationFunctionTypes,
  ConditionFamilyTypes,
  ConditionNode,
  DateFunctionTypes,
  DateHistogramConditionTypes,
  DraggableConfig,
  FunctionFamilyTypes,
  FunctionNode,
  LabelNode,
  NumberConditionTypes,
  SortTypes,
  StringConditionTypes,
  VisualizationItemData,
  WidgetType
} from '@/shared';

export class FunctionFamilyInfo {
  family: string;
  type: string;

  constructor(family: string, type?: string) {
    this.family = family;
    this.type = type ?? '';
  }
}

export enum ConfigType {
  xAxis = 'xAxis',
  yAxis = 'yAxis',
  legend = 'legend',
  legendOptional = 'legendOptional',
  legends = 'legends',
  value = 'value',
  values = 'values',
  columns = 'columns',
  rows = 'rows',
  label = 'label',
  location = 'location',
  breakdownOptional = 'breakdownOptional',

  filters = 'filters',
  sorting = 'sorting',
  tooltips = 'tooltips'
}

const GROUP_FUNCTION_FOR_TEXT = new FunctionFamilyInfo(FunctionFamilyTypes.groupBy);
const GROUP_FUNCTION_FOR_DATE = new FunctionFamilyInfo(FunctionFamilyTypes.dateHistogram, DateFunctionTypes.year);
const GROUP_FUNCTION_FOR_NUMBER = new FunctionFamilyInfo(FunctionFamilyTypes.groupBy);

const NONE_FUNCTION_FOR_TEXT = new FunctionFamilyInfo(FunctionFamilyTypes.none);
const NONE_FUNCTION_FOR_DATE = new FunctionFamilyInfo(FunctionFamilyTypes.none);
const NONE_FUNCTION_FOR_NUMBER = new FunctionFamilyInfo(FunctionFamilyTypes.none);

const AGGREGATION_FUNCTION_FOR_TEXT = new FunctionFamilyInfo(FunctionFamilyTypes.aggregation, AggregationFunctionTypes.countAll);
const AGGREGATION_FUNCTION_FOR_DATE = new FunctionFamilyInfo(FunctionFamilyTypes.aggregation, AggregationFunctionTypes.countAll);
const AGGREGATION_FUNCTION_FOR_NUMBER = new FunctionFamilyInfo(FunctionFamilyTypes.aggregation, AggregationFunctionTypes.sum);

export abstract class DataBuilderConstants {
  static readonly FUNCTION_NODES: FunctionNode[] = [
    {
      label: FunctionFamilyTypes.groupBy
    },
    {
      label: FunctionFamilyTypes.dateHistogram,
      subFunctions: [
        {
          type: 'group',
          label: 'Continuous',
          options: [
            { label: DateFunctionTypes.secondOf },
            { label: DateFunctionTypes.minuteOf },
            { label: DateFunctionTypes.hourOf },
            { label: DateFunctionTypes.dayOf },
            { label: DateFunctionTypes.weekOf },
            { label: DateFunctionTypes.monthOf },
            { label: DateFunctionTypes.quarterOf },
            { label: DateFunctionTypes.yearlyOf }
          ]
        },
        {
          type: 'group',
          label: 'Periodic',
          options: [
            { label: DateFunctionTypes.year },
            { label: DateFunctionTypes.quarterOfYear },
            { label: DateFunctionTypes.monthOfYear },
            { label: DateFunctionTypes.dayOfYear },
            { label: DateFunctionTypes.dayOfMonth },
            { label: DateFunctionTypes.dayOfWeek },
            { label: DateFunctionTypes.hourOfDay },
            { label: DateFunctionTypes.minuteOfHour },
            { label: DateFunctionTypes.secondOfMinute }
            // { label: FUNCTION_DATE_TYPE.DYNAMIC }
          ]
        }
      ]
    },
    // {
    //   label:FUNCTION_FAMILY.GEOSPATIAL,
    //   subFunctions: [
    //     { label:FUNCTION_GEOSPATIAL_TYPE.COUNTRY_OF },
    //     { label:FUNCTION_GEOSPATIAL_TYPE.CITY_OF },
    //     { label:FUNCTION_GEOSPATIAL_TYPE.STATE_OF },
    //     {
    //       label:FUNCTION_GEOSPATIAL_TYPE.DISTRICT_OF
    //     },
    //     {
    //       label:FUNCTION_GEOSPATIAL_TYPE.LONG_LAST_OF
    //     }
    //   ]
    // },
    {
      label: FunctionFamilyTypes.aggregation,
      subFunctions: [
        { label: AggregationFunctionTypes.average },
        // {
        //   label:FUNCTION_AGGREGATION_TYPE.COLUMN_RATIO
        // },
        {
          label: AggregationFunctionTypes.sum
        },
        { label: AggregationFunctionTypes.maximum },
        { label: AggregationFunctionTypes.minimum },
        {
          label: AggregationFunctionTypes.countOfDistinct
        },
        { label: AggregationFunctionTypes.countAll }
      ]
    },
    // {
    //   label:FUNCTION_FAMILY.CUSTOM
    // },
    {
      label: FunctionFamilyTypes.none
    }
  ];

  static readonly FILTER_NODES: ConditionNode[] = [
    {
      label: ConditionFamilyTypes.dateHistogram,
      conditions: [
        {
          type: 'group',
          label: 'Activity Date',
          options: [
            {
              label: DateHistogramConditionTypes.earlierThan,
              values: ['d']
            },
            {
              label: DateHistogramConditionTypes.laterThan,
              values: ['d']
            },
            {
              label: DateHistogramConditionTypes.between,
              values: ['d', 'd']
            },
            {
              label: DateHistogramConditionTypes.betweenAndIncluding,
              values: ['d', 'd']
            }
          ]
        },
        {
          type: 'group',
          label: 'Relative Date',
          options: [
            {
              label: DateHistogramConditionTypes.lastNMinutes,
              values: ['n']
            },
            {
              label: DateHistogramConditionTypes.lastNHours,
              values: ['n']
            },
            {
              label: DateHistogramConditionTypes.lastNDays,
              values: ['n']
            },
            {
              label: DateHistogramConditionTypes.lastNWeeks,
              values: ['n']
            },
            {
              label: DateHistogramConditionTypes.lastNMonths,
              values: ['n']
            },
            {
              label: DateHistogramConditionTypes.lastNYears,
              values: ['n']
            }
          ]
        },
        // {
        //   type: 'group',
        //   label: 'Between Dates',
        //   options: [
        //     {
        //       label: CONDITION_DATE_HISTOGRAMS.BETWEEN_N_M_MINUTES_BEFORE_NOW,
        //       values: ['n', 'n']
        //     },
        //     {
        //       label: CONDITION_DATE_HISTOGRAMS.BETWEEN_N_M_HOURS_BEFORE_NOW,
        //       values: ['n', 'n']
        //     },
        //     {
        //       label: CONDITION_DATE_HISTOGRAMS.BETWEEN_N_M_DAYS_BEFORE_NOW,
        //       values: ['n', 'n']
        //     },
        //     {
        //       label: CONDITION_DATE_HISTOGRAMS.BETWEEN_N_M_WEEKS_BEFORE_NOW,
        //       values: ['n', 'n']
        //     },
        //     {
        //       label: CONDITION_DATE_HISTOGRAMS.BETWEEN_N_M_MONTHS_BEFORE_NOW,
        //       values: ['n', 'n']
        //     },
        //     {
        //       label: CONDITION_DATE_HISTOGRAMS.BETWEEN_N_M_YEARS_BEFORE_NOW,
        //       values: ['n', 'n']
        //     }
        //   ]
        // },
        {
          type: 'group',
          label: 'Current Date',
          options: [
            { label: DateHistogramConditionTypes.currentDay },
            { label: DateHistogramConditionTypes.currentWeek },
            { label: DateHistogramConditionTypes.currentMonth },
            { label: DateHistogramConditionTypes.currentQuarter },
            { label: DateHistogramConditionTypes.currentYear }
          ]
        }
      ]
    },
    {
      label: ConditionFamilyTypes.number,
      conditions: [
        {
          label: NumberConditionTypes.equal
        },
        {
          label: NumberConditionTypes.notEqual
        },
        {
          label: NumberConditionTypes.greaterThan
        },
        {
          label: NumberConditionTypes.greaterThanOrEqual
        },
        {
          label: NumberConditionTypes.lessThan
        },
        {
          label: NumberConditionTypes.lessThanOrEqual
        },
        {
          label: NumberConditionTypes.between,
          value: ['n', 'm']
        },
        {
          label: NumberConditionTypes.betweenAndIncluding,
          value: ['n', 'm']
        }
      ]
    },
    {
      label: ConditionFamilyTypes.string,
      conditions: [
        {
          type: 'group',
          label: 'Exact match',
          options: [
            { label: StringConditionTypes.equal },
            { label: StringConditionTypes.notEqual }
            // { label: CONDITION_STRINGS.IS_ONE_OF },
            // { label: CONDITION_STRINGS.IS_NOT_ONE_OF }
          ]
        },
        {
          type: 'group',
          label: 'Present',
          options: [{ label: StringConditionTypes.isnull }, { label: StringConditionTypes.notNull }]
        },
        {
          type: 'group',
          label: 'Pattern match',
          options: [
            { label: StringConditionTypes.like },
            { label: StringConditionTypes.notLike },
            { label: StringConditionTypes.matchesRegex },
            { label: StringConditionTypes.likeCaseInsensitive },
            { label: StringConditionTypes.notLikeCaseInsensitive }
          ]
        }
      ]
    }
    // {
    //   label: FILTER_FAMILY.GEOSPATIAL,
    //   conditions: [
    //     { label: CONDITION_GEOSPATIAL.COUNTRY_OF },
    //     { label: CONDITION_GEOSPATIAL.CITY_OF },
    //     { label: CONDITION_GEOSPATIAL.STATE_OF },
    //     { label: CONDITION_GEOSPATIAL.DISTRICT_OF },
    //     { label: CONDITION_GEOSPATIAL.LONG_LAST_OF }
    //   ]
    // },
    // {
    //   label: FILTER_FAMILY.CUSTOM
    // }
  ];

  static readonly SORTS_NODES: LabelNode[] = [{ label: SortTypes.Unsorted }, { label: SortTypes.AscendingOrder }, { label: SortTypes.DescendingOrder }];
}

export abstract class DataBuilderConstantsV35 {
  static readonly DROP_DOWN_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    }
  ];

  static readonly FILTER_CONFIGS: any[] = [
    {
      key: ConfigType.filters,
      title: 'Filters',
      placeholder: 'Drag and drop field here to filter your data',
      preferFunctionTypes: [],
      isOptional: true
    },
    {
      key: ConfigType.sorting,
      title: 'Sorting',
      placeholder: 'Drag and drop field here to sorting your data',
      preferFunctionTypes: [],
      isOptional: true
    }
    // {
    //   key: ConfigType.tooltips,
    //   title: 'Tooltips',
    //   placeholder: 'Drag and drop field here to tooltips your data'
    // }
  ];
  static readonly BELL_CURVE_EXTRA_CONFIGS: any[] = [
    {
      key: ConfigType.filters,
      title: 'Filters',
      placeholder: 'Drag and drop field here to filter your data',
      preferFunctionTypes: [],
      isOptional: true
    }
    // {
    //   key: ConfigType.sorting,
    //   title: 'Sorting',
    //   placeholder: 'Drag and drop field here to sorting your data',
    //   preferFunctionTypes: [],
    //   isOptional: true
    // }
    // {
    //   key: ConfigType.tooltips,
    //   title: 'Tooltips',
    //   placeholder: 'Drag and drop field here to tooltips your data'
    // }
  ];

  static readonly SERIES_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.xAxis,
      title: 'X-Axis',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.yAxis,
      title: 'Y-Axis',
      placeholder: 'Drag and drop your fields here',
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.legendOptional,
      title: 'Legend',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      isOptional: true,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    }
  ];
  static readonly STACKING_SERIES_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.xAxis,
      title: 'X-Axis',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.yAxis,
      title: 'Y-Axis',
      placeholder: 'Drag and drop your fields here',
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.legendOptional,
      title: 'Legend',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      isOptional: true,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.breakdownOptional,
      title: 'Breakdown',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      isOptional: true,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    }
  ];

  // static readonly DRILLDOWN_CONFIGS: DraggableConfig[] = [
  //   {
  //     key: ConfigType.legends,
  //     title: 'Legends',
  //     placeholder: 'Drag and drop your fields here',
  //     preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram]
  //   },
  //   {
  //     key: ConfigType.value,
  //     title: 'Value',
  //     placeholder: 'Drag and drop your fields here',
  //     preferFunctionTypes: [FunctionFamilyTypes.aggregation],
  //     maxItem: 1
  //   }
  // ];

  // static readonly DRILLDOWN_PIE_CONFIGS: DraggableConfig[] = [...DataBuilderConstantsV35.DRILLDOWN_CONFIGS];

  static readonly SCATTER_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.xAxis,
      title: 'X-Axis',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.none, FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram, FunctionFamilyTypes.aggregation],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    },
    {
      key: ConfigType.yAxis,
      title: 'Y-Axis',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.none, FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram, FunctionFamilyTypes.aggregation],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    },
    {
      key: ConfigType.legendOptional,
      title: 'Legend',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      isOptional: true,
      preferFunctionTypes: [FunctionFamilyTypes.none, FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    }
  ];

  static readonly PARLIAMENT_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.legend,
      title: 'Legend',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];

  static readonly PIE_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.legend,
      title: 'Legend',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];

  static readonly FUNNEL_CONFIGS: DraggableConfig[] = [...DataBuilderConstantsV35.PIE_CONFIGS];

  static readonly PYRAMID_CONFIGS: DraggableConfig[] = [...DataBuilderConstantsV35.PIE_CONFIGS];

  static readonly GAUGE_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];

  static readonly BUBBLE_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.xAxis,
      title: 'X-Axis',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.none, FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    },
    {
      key: ConfigType.yAxis,
      title: 'Y-Axis',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.none, FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    },
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.none, FunctionFamilyTypes.aggregation],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    },
    {
      key: ConfigType.legendOptional,
      title: 'Legend',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      isOptional: true,
      preferFunctionTypes: [FunctionFamilyTypes.none],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    }
  ];

  static readonly PARETO_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.xAxis,
      title: 'X-Axis',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.yAxis,
      title: 'Y-Axis',
      placeholder: 'Drag and drop your fields here',
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.legendOptional,
      title: 'Legend',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      isOptional: true,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    }
  ];

  static readonly BELL_CURVE_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.none, FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    }
  ];

  static readonly HEAT_MAP_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.xAxis,
      title: 'X-Axis',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.yAxis,
      title: 'Y-Axis',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];

  static readonly NUMBER_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];

  static readonly TABLE_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.columns,
      title: 'Columns',
      placeholder: 'Drag and drop your fields here',
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram, FunctionFamilyTypes.aggregation, FunctionFamilyTypes.none],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    }
  ];

  static readonly WORD_CLOUD_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.legend,
      title: 'Legend',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];

  static readonly TREE_MAP_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.legends,
      title: 'Legends',
      placeholder: 'Drag and drop your fields here',
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.value,
      title: 'Values',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];

  static readonly HISTOGRAM_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.none],
      defaultTextFunctionInfo: NONE_FUNCTION_FOR_TEXT,
      defaultNumberFunctionInfo: NONE_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: NONE_FUNCTION_FOR_DATE
    }
  ];

  static readonly MAP_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.location,
      title: 'Location',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.value,
      title: 'Value',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];

  static readonly PIVOT_TABLE_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.columns,
      title: 'Columns',
      placeholder: 'Drag and drop your fields here',
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.rows,
      title: 'Rows',
      placeholder: 'Drag and drop your fields here',
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.values,
      title: 'Values',
      placeholder: 'Drag and drop your fields here',
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];
  static readonly SPIDER_CONFIGS: DraggableConfig[] = [
    {
      key: ConfigType.legend,
      title: 'Legend',
      placeholder: 'Drag and drop your fields here',
      maxItem: 1,
      preferFunctionTypes: [FunctionFamilyTypes.groupBy, FunctionFamilyTypes.dateHistogram],
      defaultNumberFunctionInfo: GROUP_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: GROUP_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: GROUP_FUNCTION_FOR_TEXT
    },
    {
      key: ConfigType.values,
      title: 'Values',
      placeholder: 'Drag and drop your fields here',
      preferFunctionTypes: [FunctionFamilyTypes.aggregation],
      defaultNumberFunctionInfo: AGGREGATION_FUNCTION_FOR_NUMBER,
      defaultDateFunctionInfo: AGGREGATION_FUNCTION_FOR_DATE,
      defaultTextFunctionInfo: AGGREGATION_FUNCTION_FOR_TEXT
    }
  ];

  static readonly ALL_CHARTS: VisualizationItemData[] = [
    {
      title: 'Table',
      src: 'ic_table.svg',
      type: WidgetType.table,
      configPanels: DataBuilderConstantsV35.TABLE_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Pivot Table',
      src: 'ic_pivot_table.svg',
      type: WidgetType.pivotTable,
      configPanels: DataBuilderConstantsV35.PIVOT_TABLE_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Number',
      src: 'ic_number.svg',
      type: WidgetType.kpi,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.NUMBER_CONFIGS
    },
    {
      title: 'Line',
      src: 'ic_line_chart.svg',
      type: WidgetType.line,
      configPanels: DataBuilderConstantsV35.SERIES_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Area',
      src: 'ic_chart_area.svg',
      type: WidgetType.area,
      configPanels: DataBuilderConstantsV35.SERIES_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Column',
      src: 'ic_column.svg',
      type: WidgetType.column,
      configPanels: DataBuilderConstantsV35.SERIES_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Bar',
      src: 'ic_bar.svg',
      type: WidgetType.bar,
      configPanels: DataBuilderConstantsV35.SERIES_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Parliament',
      src: 'ic_parliament.svg',
      type: WidgetType.parliament,
      configPanels: DataBuilderConstantsV35.PARLIAMENT_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Pie',
      src: 'ic_pie.svg',
      type: WidgetType.pie,
      configPanels: DataBuilderConstantsV35.PIE_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    // {
    //   title: 'Drilldown Column',
    //   src: 'ic_drilldown_column.svg',
    //   type: WidgetType.columnDrillDown,
    //   extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
    //   configPanels: DataBuilderConstantsV35.DRILLDOWN_CONFIGS
    // },
    // {
    //   title: 'Drilldown Bar',
    //   src: 'ic_drilldown_bar.svg',
    //   type: WidgetType.barDrillDown,
    //   extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
    //   configPanels: DataBuilderConstantsV35.DRILLDOWN_CONFIGS
    // },
    // {
    //   title: 'Drilldown Pie',
    //   src: 'ic_drilldown_pie.svg',
    //   type: WidgetType.pieDrillDown,
    //   extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
    //   configPanels: DataBuilderConstantsV35.DRILLDOWN_PIE_CONFIGS
    // },
    {
      title: 'Scatter',
      src: 'ic_scatter.svg',
      type: WidgetType.scatter,
      configPanels: DataBuilderConstantsV35.SCATTER_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Bubble',
      src: 'ic_bubble.svg',
      type: WidgetType.bubble,
      configPanels: DataBuilderConstantsV35.BUBBLE_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Funnel',
      src: 'ic_funnel.svg',
      type: WidgetType.funnel,
      configPanels: DataBuilderConstantsV35.FUNNEL_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Pyramid',
      src: 'ic_pyramid.svg',
      type: WidgetType.pyramid,
      configPanels: DataBuilderConstantsV35.PYRAMID_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    // {
    //   title: 'Histogram',
    //   src: 'ic_histogram.svg',
    //   type: Charts.histogram,
    //   extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
    //   configPanels: DataBuilderConstantsV35.TWO_CONFIGS,
    //   tabConfigs: VisualizationSettings.DEFAULT
    // },
    {
      title: 'Pareto',
      src: 'ic_pareto.svg',
      type: WidgetType.pareto,
      configPanels: DataBuilderConstantsV35.PARETO_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    },
    {
      title: 'Bell curve',
      src: 'ic_bell_curve.svg',
      type: WidgetType.bellCurve,
      configPanels: DataBuilderConstantsV35.BELL_CURVE_CONFIGS,
      extraPanels: DataBuilderConstantsV35.BELL_CURVE_EXTRA_CONFIGS
    },
    // {
    //   title: 'Combinations',
    //   src: 'ic_combination.svg',
    //   type: 'chart-combination'
    // },
    // {
    //   title: 'Accessible',
    //   src: 'ic_accessible.svg',
    //   type: 'chart-accessible'
    // },
    // {
    //   title: 'Dynamic',
    //   src: 'ic_dynamic.svg',
    //   type: 'chart-dynamic'
    // },
    // { title: '3D', src: 'ic_3d.svg', type: 'chart-3d' },
    {
      title: 'Gauges',
      src: 'ic_gauge.svg',
      type: WidgetType.gauges,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.GAUGE_CONFIGS
    },
    {
      title: 'Heat maps',
      src: 'ic_heatmap.svg',
      type: WidgetType.heatMap,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.HEAT_MAP_CONFIGS
    },
    {
      title: 'Word Cloud',
      src: 'ic_word_cloud.svg',
      type: WidgetType.wordCloud,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.WORD_CLOUD_CONFIGS
    },
    {
      title: 'Tree maps',
      src: 'ic_tree_map.svg',
      type: WidgetType.treeMap,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.TREE_MAP_CONFIGS
    },
    {
      title: 'Stacked Column',
      src: 'ic_stack_column.svg',
      type: WidgetType.stackedColumn,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.STACKING_SERIES_CONFIGS
    },
    {
      title: 'Stacked Bar',
      src: 'ic_stack_bar.svg',
      type: WidgetType.stackedBar,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.STACKING_SERIES_CONFIGS
    },
    {
      title: 'Histogram',
      src: 'ic_histogram.svg',
      type: WidgetType.histogram,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.HISTOGRAM_CONFIGS
    },
    {
      title: 'Map',
      src: 'ic_map.svg',
      type: WidgetType.map,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.MAP_CONFIGS
    },
    {
      title: 'Spider Web',
      src: 'ic-spider-chart.svg',
      type: WidgetType.spiderWeb,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS,
      configPanels: DataBuilderConstantsV35.SPIDER_CONFIGS
    }
  ];

  static readonly ALL_FILTERS: VisualizationItemData[] = [
    // {
    //   title: 'Dropdown',
    //   src: 'ic_dropdown.svg',
    //   type: WidgetType.dropdownFilter,
    //   configPanels: DataBuilderConstantsV35.DROP_DOWN_CONFIGS,
    //   extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    // },
    {
      title: 'Tab Filter',
      src: 'ic_tab_filter.svg',
      type: WidgetType.tabFilter,
      configPanels: DataBuilderConstantsV35.DROP_DOWN_CONFIGS,
      extraPanels: DataBuilderConstantsV35.FILTER_CONFIGS
    }
  ];
}

export {
  GROUP_FUNCTION_FOR_DATE,
  GROUP_FUNCTION_FOR_NUMBER,
  GROUP_FUNCTION_FOR_TEXT,
  AGGREGATION_FUNCTION_FOR_NUMBER,
  AGGREGATION_FUNCTION_FOR_DATE,
  AGGREGATION_FUNCTION_FOR_TEXT,
  NONE_FUNCTION_FOR_DATE,
  NONE_FUNCTION_FOR_NUMBER,
  NONE_FUNCTION_FOR_TEXT
};
