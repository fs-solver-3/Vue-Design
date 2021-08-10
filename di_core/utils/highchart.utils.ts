import { merge } from 'lodash';

export interface HighchartBuilder {
  buildChart(chart: Record<string, any>): void;
  buildTitle(title: Record<string, any>): void;
  buildSubtitle(subtitle: Record<string, any>): void;
  buildXAxis(xAxis: Record<string, any>): void;
  buildYAxis(yAxis: Record<string, any>): void;
  buildLegend(legend: Record<string, any>): void;
  buildData(data: Record<string, any>): void;
  buildPlotOptions(plotOptions: Record<string, any>): void;
  buildSeries(series: Record<string, any>[]): void;
  buildResponsive(responsive: Record<string, any>): void;
  enhanceSettings(options: Record<string, any>): void;
  build(): Record<string, any>;
}

export class HighchartBuilderImpl implements HighchartBuilder {
  private options: {
    chart: Record<string, any>;
    title: Record<string, any>;
    subtitle: Record<string, any>;
    xAxis: Record<string, any>;
    yAxis: Record<string, any>;
    legend: Record<string, any>;
    data: Record<string, any>;
    plotOptions: Record<string, any>;
    series: Record<string, any>[];
    responsive: Record<string, any>;
  } = {
    chart: {},
    title: {},
    subtitle: {},
    xAxis: {},
    yAxis: {},
    legend: {},
    data: {},
    plotOptions: {},
    series: [],
    responsive: {}
  };

  reset(): void {
    this.options = {
      chart: {},
      title: {},
      subtitle: {},
      xAxis: {},
      yAxis: {},
      legend: {},
      data: {},
      plotOptions: {},
      series: [],
      responsive: {}
    };
  }

  buildChart(chart: Record<string, any>): void {
    this.options.chart = chart;
  }

  buildTitle(title: Record<string, any>): void {
    this.options.title = title;
  }

  buildSubtitle(subtitle: Record<string, any>): void {
    this.options.subtitle = subtitle;
  }

  buildXAxis(xAxis: Record<string, any>): void {
    this.options.xAxis = xAxis;
  }

  buildYAxis(yAxis: Record<string, any>): void {
    this.options.yAxis = yAxis;
  }

  buildLegend(legend: Record<string, any>): void {
    this.options.legend = legend;
  }

  buildData(data: Record<string, any>): void {
    this.options.data = data;
  }

  buildPlotOptions(plotOptions: Record<string, any>): void {
    this.options.plotOptions = plotOptions;
  }

  buildSeries(series: Record<string, any>[]): void {
    this.options.series = series;
  }

  buildResponsive(responsive: Record<string, any>): void {
    this.options.responsive = responsive;
  }

  enhanceSettings(options: Record<string, any>): void {
    merge(this.options, options);
  }

  build(): Record<string, any> {
    const result = this.options;
    this.reset();
    return result;
  }
}

export interface ChartBuilder {
  useDefaultSettings(): void;
}

export class LineChartBuilder extends HighchartBuilderImpl implements ChartBuilder {
  useDefaultSettings() {
    const chart = {
      type: 'line'
    };
    const title = {
      text: 'Datainser - Title of chart'
    };
    const subtitle = {
      text: 'Datainser - Subtitle of chart'
    };
    const xAxis = {
      type: 'category',
      title: {
        text: 'Datainser - X Axis'
      }
    };
    const yAxis = {
      title: {
        text: 'Datainser - Y Axis'
      }
    };
    const legend = {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle'
    };
    const plotOptions = {
      series: {
        marker: {
          enabled: false
        }
      }
    };
    const responsive = {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }
      ]
    };
    super.buildChart(chart);
    super.buildTitle(title);
    super.buildXAxis(xAxis);
    super.buildYAxis(yAxis);
    super.buildLegend(legend);
    super.buildSubtitle(subtitle);
    super.buildPlotOptions(plotOptions);
    super.buildResponsive(responsive);
  }
}
