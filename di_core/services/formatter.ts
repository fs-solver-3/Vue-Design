import { ChartUtils, ListUtils } from '@/utils';
import Highcharts from 'highcharts';
export interface RangeData {
  divider: number;
  suffix: string;
}

/**
 * Formatter cho 1 số
 */
export class NumberFormatter {
  public precision: number;
  public ranges: RangeData[];

  constructor(ranges: RangeData[] | undefined, precision = 2) {
    this.precision = precision;
    this.ranges = ranges ?? [];
  }

  setRanges(ranges: RangeData[] | undefined) {
    this.ranges = ranges ?? [];
  }

  formatWithType(data: number, type: string): string {
    if (ChartUtils.isNumberType(type)) {
      return this.format(data);
    } else {
      return data.toString();
    }
  }

  /**
   *format number -> string(number + suffix)
   *example with default precision = 2
   *1000 -> 1k
   *1.345 -> 1.35
   *52150 -> 52,15k
   */
  format(data: number): string {
    if (ListUtils.isNotEmpty(this.ranges)) {
      for (let rangeIndex = 0; rangeIndex < this.ranges.length; rangeIndex++) {
        const absData = Math.abs(data); //-100 -> 100
        const threshold = this.ranges[rangeIndex].divider;
        if (absData >= threshold) {
          const suffix = this.ranges[rangeIndex].suffix;
          return NumberFormatter.round(data / threshold).toString() + suffix;
        }
      }
      return NumberFormatter.round(data).toString();
    } else {
      return Highcharts.numberFormat(data, 0);
    }
  }

  static round(number: number, roundingPrecision = 2) {
    return Math.round(number * Math.pow(10, roundingPrecision)) / Math.pow(10, roundingPrecision);
  }
}
