import { WidgetType } from '@/shared';

export interface Page {
  hintTexts: string[];
  image: string;
}

export interface HintChartData {
  type: WidgetType;
  name: string;
  pages: Page[];
}

export const HintCharts: Record<string, HintChartData> = {
  [WidgetType.pie]: {
    type: WidgetType.pie,
    name: 'Pie',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Pie Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-pie.svg'
      }
    ]
  },
  [WidgetType.funnel]: {
    type: WidgetType.funnel,
    name: 'Funnel',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Funnel Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-funnel.svg'
      }
    ]
  },
  [WidgetType.pyramid]: {
    type: WidgetType.pyramid,
    name: 'Pyramid',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Pyramid Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-pyramid.svg'
      }
    ]
  },
  [WidgetType.area]: {
    type: WidgetType.area,
    name: 'Area',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Area Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-area.svg'
      }
    ]
  },
  [WidgetType.column]: {
    type: WidgetType.column,
    name: 'Column',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Column Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-column.svg'
      }
    ]
  },
  [WidgetType.bar]: {
    type: WidgetType.bar,
    name: 'Bar',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Bar Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-bar.svg'
      }
    ]
  },
  [WidgetType.line]: {
    type: WidgetType.line,
    name: 'Line',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Line Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-line.svg'
      }
    ]
  },
  [WidgetType.histogram]: {
    type: WidgetType.histogram,
    name: 'Histogram',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Histogram Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-histogram.svg'
      }
    ]
  },
  [WidgetType.pareto]: {
    type: WidgetType.pareto,
    name: 'Pareto',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Pareto Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-pareto.svg'
      }
    ]
  },
  [WidgetType.scatter]: {
    type: WidgetType.scatter,
    name: 'Scatter',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Scatter Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-scatter.svg'
      }
    ]
  },
  [WidgetType.bubble]: {
    type: WidgetType.bubble,
    name: 'Bubble',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Bubble Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-bubble.svg'
      }
    ]
  },
  [WidgetType.kpi]: {
    type: WidgetType.kpi,
    name: 'KPI',
    pages: [
      {
        hintTexts: ['- Drag the Value properties you want to display on the Number Chart.'],
        image: 'hint-number.svg'
      }
    ]
  },
  [WidgetType.columnDrillDown]: {
    type: WidgetType.columnDrillDown,
    name: 'Drilldown Column',
    pages: [
      {
        hintTexts: [
          '- Drag the Legend properties you want to display on the Drilldown Column Chart.',
          '- Drag the values corresponding to the Legend properties.'
        ],
        image: 'hint-drilldown-column.svg'
      }
    ]
  },
  [WidgetType.pieDrillDown]: {
    type: WidgetType.pieDrillDown,
    name: 'Drilldown Pie',
    pages: [
      {
        hintTexts: [
          '- Drag the Legend properties you want to display on the Drilldown Pie Chart.',
          '- Drag the values corresponding to the Legend properties.'
        ],
        image: 'hint-drilldown-pie.svg'
      }
    ]
  },
  [WidgetType.barDrillDown]: {
    type: WidgetType.barDrillDown,
    name: 'Drilldown Bar',
    pages: [
      {
        hintTexts: [
          '- Drag the Legend properties you want to display on the Drilldown Bar Chart.',
          '- Drag the values corresponding to the Legend properties.'
        ],
        image: 'hint-drilldown-bar.svg'
      }
    ]
  },
  [WidgetType.heatMap]: {
    type: WidgetType.heatMap,
    name: 'Heat maps',
    pages: [
      {
        hintTexts: ['- Drag the Legend properties you want to display on the Heat maps Chart.', '- Drag the values corresponding to the Legend properties.'],
        image: 'hint-heatmap.svg'
      }
    ]
  },
  [WidgetType.gauges]: {
    type: WidgetType.gauges,
    name: 'Gauges',
    pages: [
      {
        hintTexts: ['- Drag the Value properties you want to display on the Gauges Chart.'],
        image: 'hint-gauges.svg'
      }
    ]
  }
};
