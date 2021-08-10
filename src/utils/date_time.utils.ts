import moment from 'moment';
import { CompareMode, DateRange } from '@/shared';
import { MainDateFilterMode } from '@core/domain/Model';

export class FormatDateTime {
  static formatDate(currentData: Date | string): string {
    const date = moment(currentData).toDate();
    let day = date.getDate().toString();
    let month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return `${year}-${month}-${day} 00:00:00`;
  }

  static formatDateDisplay(currentData: Date | string): string {
    const date = moment(currentData).toDate();
    let day = date.getDate().toString();
    let month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    const shortMonthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format;
    const shortName = shortMonthName(date);
    return `${shortName} ${day},${year} `;
  }

  static formatAsHms(time: number): string {
    const hours = Math.trunc(moment.duration(time).asHours());
    const minutes = moment.duration(time).minutes();
    const seconds = moment.duration(time).seconds();
    if (hours === 0 && minutes === 0) {
      return `${seconds}s`;
    } else if (hours === 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
  }
  static formatAsDDMMYYYYHms(time: number): string {
    return moment(time).format('DD/MM/YYYY hh:mm:ss');
  }
}

export class DateUtils {
  static getThisWeek(): DateRange {
    const weekStart = moment().startOf('week');
    const result: DateRange = { start: weekStart.toDate(), end: moment().toDate() };
    return result;
  }

  static getThisMonth(): DateRange {
    const monthStart = moment().startOf('month');
    const result: DateRange = { start: monthStart.toDate(), end: moment().toDate() };
    return result;
  }

  static getThisQuarter(): DateRange {
    const quarterStart = moment().startOf('quarter');
    const result: DateRange = { start: quarterStart.toDate(), end: moment().toDate() };
    return result;
  }

  static getThisYear(): DateRange {
    const yearStart = moment().startOf('year');
    const result: DateRange = { start: yearStart.toDate(), end: moment().toDate() };
    return result;
  }

  static getLastDay(): DateRange {
    const lastDay = moment().add(-1, 'd');
    const result: DateRange = { start: lastDay.toDate(), end: lastDay.toDate() };
    return result;
  }

  static getLastWeek(): DateRange {
    const lastWeekStartDay = moment()
      .subtract(1, 'week')
      .startOf('week');
    const lastWeekEndDay = moment()
      .subtract(1, 'week')
      .endOf('week');
    const result: DateRange = { start: lastWeekStartDay.toDate(), end: lastWeekEndDay.toDate() };
    return result;
  }

  static getLastMonth(): DateRange {
    const lastMonthStartDay = moment()
      .subtract(1, 'month')
      .startOf('month');
    const lastMonthEndDay = moment()
      .subtract(1, 'month')
      .endOf('month');
    const result: DateRange = { start: lastMonthStartDay.toDate(), end: lastMonthEndDay.toDate() };
    return result;
  }

  static getLastQuarter(): DateRange {
    const lastQuarterStartDay = moment()
      .subtract(1, 'quarter')
      .startOf('quarter');
    const lastQuarterEndDay = moment()
      .subtract(1, 'quarter')
      .endOf('quarter');
    const result: DateRange = {
      start: lastQuarterStartDay.toDate(),
      end: lastQuarterEndDay.toDate()
    };
    return result;
  }

  static getLastYear(): DateRange {
    const lastYearStartDay = moment()
      .subtract(1, 'year')
      .startOf('year');
    const lastYearEndDay = moment()
      .subtract(1, 'year')
      .endOf('year');
    const result: DateRange = { start: lastYearStartDay.toDate(), end: lastYearEndDay.toDate() };
    return result;
  }

  static getLast7Day(): DateRange {
    const last7Day = moment().add(-7, 'd');
    const result: DateRange = { start: last7Day.toDate(), end: moment().toDate() };
    return result;
  }

  static getLast30Days(): DateRange {
    const last30Day = moment().add(-30, 'd');
    const result: DateRange = { start: last30Day.toDate(), end: moment().toDate() };
    return result;
  }

  static compareToPreviousPeriod(currentStartDate: Date | string | null | undefined, currentEndDate: Date | string | null | undefined): DateRange {
    const newEndDate = moment(currentStartDate).add(-1, 'd');
    const duration = moment(currentStartDate).diff(moment(currentEndDate), 'days');
    const newStartDate = moment(newEndDate).add(duration, 'd');
    const result: DateRange = { start: newStartDate.toDate(), end: newEndDate.toDate() };
    return result;
  }

  static compareToSamePeriodLastMonth(currentStartDate: Date | string | null | undefined, currentEndDate: Date | string | null | undefined): DateRange {
    const newStartDate = moment(currentStartDate).add(-1, 'M');
    const newEndDate = moment(currentEndDate).add(-1, 'M');
    const result: DateRange = { start: newStartDate.toDate(), end: newEndDate.toDate() };
    return result;
  }

  static compareToSamePeriodLastQuarter(currentStartDate: Date | string | null | undefined, currentEndDate: Date | string | null | undefined): DateRange {
    const newStartDate = moment(currentStartDate).add(-1, 'Q');
    const newEndDate = moment(currentEndDate).add(-1, 'Q');
    const result: DateRange = { start: newStartDate.toDate(), end: newEndDate.toDate() };
    return result;
  }

  static compareToSamePeriodLastYear(currentStartDate: Date | string | null | undefined, currentEndDate: Date | string | null | undefined): DateRange {
    const newStartDate = moment(currentStartDate).add(-1, 'y');
    const newEndDate = moment(currentEndDate).add(-1, 'y');
    const result: DateRange = { start: newStartDate.toDate(), end: newEndDate.toDate() };
    return result;
  }

  static getThisDay() {
    return { start: new Date(), end: new Date() };
  }

  static getChosenDateRange(mode: MainDateFilterMode): DateRange | null {
    switch (mode) {
      case MainDateFilterMode.thisDay:
        return DateUtils.getThisDay();
      case MainDateFilterMode.thisWeek:
        return DateUtils.getThisWeek();
      case MainDateFilterMode.thisMonth:
        return DateUtils.getThisMonth();

      case MainDateFilterMode.thisQuarter:
        return DateUtils.getThisQuarter();

      case MainDateFilterMode.thisYear:
        return DateUtils.getThisYear();

      case MainDateFilterMode.lastDay:
        return DateUtils.getLastDay();

      case MainDateFilterMode.lastWeek:
        return DateUtils.getLastWeek();

      case MainDateFilterMode.lastMonth:
        return DateUtils.getLastMonth();

      case MainDateFilterMode.lastQuarter:
        return DateUtils.getLastQuarter();

      case MainDateFilterMode.lastYear:
        return DateUtils.getLastYear();

      case MainDateFilterMode.last7Days:
        return DateUtils.getLast7Day();

      case MainDateFilterMode.last30Days:
        return DateUtils.getLast30Days();

      default:
        return null;
    }
  }

  static getCompareDateRange(compareMode: CompareMode, currentRange: DateRange): DateRange | null {
    switch (compareMode) {
      case CompareMode.none:
        return null;
      case CompareMode.previousPeriod:
        return DateUtils.compareToPreviousPeriod(currentRange?.start, currentRange?.end);
      case CompareMode.samePeriodLastMonth:
        return DateUtils.compareToSamePeriodLastMonth(currentRange?.start, currentRange?.end);
      case CompareMode.samePeriodLastQuarter:
        return DateUtils.compareToSamePeriodLastQuarter(currentRange?.start, currentRange?.end);
      case CompareMode.samePeriodLastYear:
        return DateUtils.compareToSamePeriodLastYear(currentRange?.start, currentRange?.end);
      default:
        return currentRange;
    }
  }

  static cloneDateRange(defaultDateRange: DateRange): DateRange {
    return {
      start: moment(defaultDateRange.start).toDate(),
      end: moment(defaultDateRange.end).toDate()
    };
  }
}
