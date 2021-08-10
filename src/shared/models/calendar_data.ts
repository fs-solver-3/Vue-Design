/*
 * @author: tvc12 - Thien Vi
 * @created: 12/18/20, 2:38 PM
 */

import { CompareMode, DateRange } from '@/shared';
import { MainDateFilterMode } from '@core/domain/Model';

export class CalendarData {
  compareDateRange: DateRange | null;
  chosenDateRange: DateRange | null;

  compareMode: CompareMode;
  filterMode: MainDateFilterMode;

  constructor(obj: { compareDateRange: DateRange | null; dateRange: DateRange | null; compareMode: CompareMode; filterMode: MainDateFilterMode }) {
    this.compareDateRange = obj.compareDateRange;
    this.chosenDateRange = obj.dateRange;
    this.compareMode = obj.compareMode;
    this.filterMode = obj.filterMode;
  }

  setChosenDateRange(dateRange: DateRange) {
    this.chosenDateRange = dateRange;
  }

  get isDisableCompare(): boolean {
    return this.isAllTime;
  }

  static default(): CalendarData {
    return new CalendarData({
      compareMode: CompareMode.none,
      filterMode: MainDateFilterMode.thisDay,
      compareDateRange: {
        start: new Date(),
        end: new Date()
      },
      dateRange: {
        start: new Date(),
        end: new Date()
      }
    });
  }

  get isAllTime(): boolean {
    return this.filterMode == MainDateFilterMode.allTime;
  }

  get isCompare(): boolean {
    return this.compareMode != CompareMode.none;
  }

  showAllTime() {
    this.filterMode = MainDateFilterMode.allTime;
    this.chosenDateRange = null;
  }

  updateCompareRange(compareRange: DateRange) {
    this.compareDateRange = {
      start: compareRange.start,
      end: compareRange.end
    };
  }

  updateChosenDateRange(newDateRange: DateRange) {
    this.chosenDateRange = {
      start: newDateRange.start,
      end: newDateRange.end
    };
  }
}
