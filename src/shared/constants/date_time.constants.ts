import { MainDateFilterMode } from '@core/domain/Model/Widget/Filter/MainDateFilterMode';
import { CompareOption, TimeOption } from '@/shared';
import { CompareMode } from '@/shared/enums/compare_option_type';

export abstract class DateTimeConstants {
  static readonly listTimePresetOptions: TimeOption[] = [
    {
      value: MainDateFilterMode.thisDay,
      label: 'This Day'
    },
    {
      value: MainDateFilterMode.thisWeek,
      label: 'This Week'
    },
    {
      value: MainDateFilterMode.thisMonth,
      label: 'This Month'
    },
    {
      value: MainDateFilterMode.thisQuarter,
      label: 'This Quarter'
    },
    {
      value: MainDateFilterMode.thisYear,
      label: 'This Year'
    },
    {
      value: MainDateFilterMode.lastDay,
      label: 'Last Day'
    },
    {
      value: MainDateFilterMode.lastWeek,
      label: 'Last Week'
    },
    {
      value: MainDateFilterMode.lastMonth,
      label: 'Last Month'
    },
    {
      value: MainDateFilterMode.lastQuarter,
      label: 'Last Quarter'
    },
    {
      value: MainDateFilterMode.lastYear,
      label: 'Last Year'
    },
    {
      value: MainDateFilterMode.last7Days,
      label: 'Last 7 Days'
    },
    {
      value: MainDateFilterMode.last30Days,
      label: 'Last 30 Days'
    },
    {
      value: MainDateFilterMode.allTime,
      label: 'All Time'
    },
    {
      value: MainDateFilterMode.custom,
      label: 'Custom'
    }
  ];

  static readonly listCompareToOptions: CompareOption[] = [
    {
      label: 'None',
      value: CompareMode.none
    },
    {
      label: 'Previous Period',
      value: CompareMode.previousPeriod
    },
    {
      label: 'Same Period Last Month',
      value: CompareMode.samePeriodLastMonth
    },
    {
      label: 'Same Period Last Quarter',
      value: CompareMode.samePeriodLastQuarter
    },
    {
      label: 'Same Period Last Year',
      value: CompareMode.samePeriodLastYear
    },
    {
      label: 'Custom',
      value: CompareMode.custom
    }
  ];

  static readonly mapMainDateFilterMode = [
    {
      mode: MainDateFilterMode.thisDay,
      text: 'This Day'
    },
    {
      mode: MainDateFilterMode.thisWeek,
      text: 'This Week'
    },
    {
      mode: MainDateFilterMode.thisMonth,
      text: 'This Month'
    },
    {
      mode: MainDateFilterMode.thisQuarter,
      text: 'This Quarter'
    },
    {
      mode: MainDateFilterMode.thisYear,
      text: 'This Year'
    },
    {
      mode: MainDateFilterMode.lastDay,
      text: 'Last Day'
    },
    {
      mode: MainDateFilterMode.lastWeek,
      text: 'Last Week'
    },
    {
      mode: MainDateFilterMode.lastMonth,
      text: 'Last Month'
    },
    {
      mode: MainDateFilterMode.lastQuarter,
      text: 'Last Quarter'
    },
    {
      mode: MainDateFilterMode.lastYear,
      text: 'Last Year'
    },
    {
      mode: MainDateFilterMode.last7Days,
      text: 'Last 7 Days'
    },
    {
      mode: MainDateFilterMode.last30Days,
      text: 'Last 30 Days'
    },
    {
      mode: MainDateFilterMode.allTime,
      text: 'All Time'
    }
  ];
}
