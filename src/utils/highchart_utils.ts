/*
 * @author: tvc12 - Thien Vi
 * @created: 1/20/21, 11:26 AM
 */

import { RangeData } from '@core/services/formatter';
import { Point, Series } from 'highcharts';

export enum MetricNumberMode {
  None = 'none',
  Mass = 'mass',
  Text = 'text',
  Default = 'default'
}

export class HighchartUtils {
  static reset(chart: Highcharts.Chart | undefined | null): void {
    if (chart) {
      while (chart.series.length) {
        chart.series[0].remove(false, false, false);
      }
    }
  }

  static addSeries(chart: Highcharts.Chart | undefined | null, series: any[]): Series[] {
    if (chart) {
      return series.map((s: any) => chart.addSeries(s, false, false));
    } else {
      return [];
    }
  }

  static drawChart(chart: Highcharts.Chart | undefined | null) {
    if (chart) {
      chart.redraw();
    }
  }

  static updateChart(chart: Highcharts.Chart | undefined | null, options: any, redraw?: boolean) {
    chart?.update(options, redraw ?? false, false, false);
  }

  static updateColors(chart: Highcharts.Chart | undefined | null, colors: string[], redraw?: boolean) {
    this.updateChart(
      chart,
      {
        colors: colors
      },
      redraw
    );
  }

  static updateChartInfo(chart: Highcharts.Chart | undefined | null, data: { title: string | undefined; subTitle: string | undefined }, redraw?: boolean) {
    if (chart) {
      chart.update(
        {
          title: {
            text: data.title
          },
          subtitle: {
            text: data.subTitle
          }
        },
        redraw ?? false,
        false,
        false
      );
    }
  }

  static toMetricNumbers(metricNumber: MetricNumberMode): string[] | undefined {
    // const metricNumbers = options.metricNumbers as string;
    switch (metricNumber) {
      case MetricNumberMode.None:
        return undefined;
      case MetricNumberMode.Mass:
        return ['kg', 'Mg', 'Gg', 'Tg', 'Pg', 'Eg'];
      case MetricNumberMode.Text:
        return [' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion'];
      default:
        return ['k', 'M', 'B', 'T', 'P', 'E'];
    }
  }

  static buildRangeData(metricNumbers: string[] | undefined): RangeData[] | undefined {
    if (metricNumbers) {
      return [
        { divider: 1e18, suffix: metricNumbers[5] },
        { divider: 1e15, suffix: metricNumbers[4] },
        { divider: 1e12, suffix: metricNumbers[3] },
        { divider: 1e9, suffix: metricNumbers[2] },
        { divider: 1e6, suffix: metricNumbers[1] },
        { divider: 1e3, suffix: metricNumbers[0] }
      ];
    }
    return undefined;
  }

  static addSeriesEvent(series: Series[], eventName: 'contextmenu', listener: (event: Event, point: Point) => void): void {
    series.forEach(item => {
      item.points.forEach((point: any) =>
        point.graphic.on(eventName, function(event: Event) {
          listener(event, point);
        })
      );
    });
  }
}
