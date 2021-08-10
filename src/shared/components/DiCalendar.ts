import { Component, Emit, Inject, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { CompareMode, DateRange, DateTimeConstants, TimeOption } from '@/shared';
import { DateUtils } from '@/utils';
import { CalendarData } from '@/shared/models';
import { MainDateFilterMode } from '@core/domain/Model';
import { cloneDeep } from 'lodash';

@Component
export default class DiCalendar extends Vue {
  @Prop({ type: Date, default: () => new Date() })
  private readonly maxDate!: Date;

  @Prop({ type: Date, default: null })
  private readonly minDate!: Date;

  @Prop({ type: String, default: 'bottom' })
  private readonly placement!: string;

  @Prop({ type: Boolean, default: false })
  private readonly isHiddenCompareToSection!: boolean;

  @Prop({ type: Boolean, default: true })
  private readonly isShowAllTime!: boolean;

  @Prop({ required: true })
  private readonly mainDateFilterMode!: MainDateFilterMode;

  @Prop({ type: String, default: 'Apply' })
  private readonly applyTextButton!: string;

  @Prop()
  private readonly defaultDateRange!: DateRange;

  @Ref()
  private datePicker!: any;

  @Ref()
  private datePickerInput!: any;

  @Prop({ required: true })
  private readonly isShowResetFilterButton!: boolean;

  @Prop({ required: false, type: Function, default: () => document.body })
  private readonly container!: () => HTMLElement;

  private currentCalendarData = CalendarData.default();

  private oldCalendarData = CalendarData.default();

  private submittedPresetDateRange: DateRange = {
    start: new Date(),
    end: new Date()
  };

  private readonly listCompareToOptions = DateTimeConstants.listCompareToOptions;

  private isShowDatePicker = false;
  private isFullSize = true;

  private errorMessage = '';

  // Provide from DashboardControlBar.ts
  @Inject({ default: undefined })
  private handleResetMainDate?: () => void;

  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
      this.onResize();
    });
    this.datePicker?.$refs?.calendar.move(this.currentCalendarData.chosenDateRange?.end);
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  }

  @Watch('mainDateFilterMode', { immediate: true, deep: true })
  onMainDateFilterModeChanged() {
    this.timePresetOptionsSelected(this.mainDateFilterMode);
    this.oldCalendarData = this.currentCalendarData;
    this.submittedPresetDateRange = this.currentCalendarData.chosenDateRange!;
  }

  private get isDisabledApplyButton() {
    return this.errorMessage !== '';
  }

  private get calendarClass() {
    if (this.isFullSize) return 'full-size-container';
    return 'cropped-container';
  }

  private get listTimePresetOptions() {
    if (this.isShowAllTime) return DateTimeConstants.listTimePresetOptions;
    else {
      return DateTimeConstants.listTimePresetOptions.filter(x => x.value !== MainDateFilterMode.allTime);
    }
  }

  private get timePresetHeight() {
    if (this.isFullSize) {
      return {
        '--di-calendar-time-preset-height': this.isHiddenCompareToSection ? '250px' : '150px',
        '--di-calendar-time-preset-height-ul': this.isHiddenCompareToSection ? '242px' : '142px'
      };
    }
    return {
      '--di-calendar-time-preset-height': this.isHiddenCompareToSection ? '230px' : '130px',
      '--di-calendar-time-preset-height-ul': this.isHiddenCompareToSection ? '222px' : '122px'
    };
  }

  private get compareClass(): string {
    if (this.currentCalendarData.isDisableCompare) {
      return 'disable-compare';
    } else {
      return '';
    }
  }

  private onResize(): void {
    this.isFullSize = window.innerWidth >= 700;
  }

  private timePresetOptionsSelected(mode: MainDateFilterMode): void {
    this.setActiveForTimePreset(mode);
    if (mode == MainDateFilterMode.custom) {
      const range = DateUtils.cloneDateRange(this.defaultDateRange);
      this.updateDateRange(range);
    } else {
      const range = DateUtils.getChosenDateRange(mode);
      this.updateDateRange(range);
    }
  }

  private ddlCompareToChanged(mode: CompareMode) {
    if (this.currentCalendarData.chosenDateRange) {
      const compareRange = DateUtils.getCompareDateRange(mode, this.currentCalendarData.chosenDateRange);
      if (compareRange) {
        this.currentCalendarData.updateCompareRange(compareRange);
      }
    }
  }

  private handleResetMainDateFilter() {
    if (this.handleResetMainDate) {
      this.handleResetMainDate();
    }
  }

  private cancel() {
    this.togglePicker(false);
    this.currentCalendarData = this.oldCalendarData;
  }

  @Emit('onCalendarSelected')
  private apply(): CalendarData {
    this.togglePicker(false);
    if (this.currentCalendarData.isAllTime) {
      this.currentCalendarData.showAllTime();
    }
    this.submittedPresetDateRange = this.currentCalendarData.chosenDateRange!;
    this.oldCalendarData = this.currentCalendarData;
    return this.currentCalendarData;
  }

  private submittedDateRangeChanged(value: DateRange) {
    if (value === null) {
      this.currentCalendarData.showAllTime();
    }
    this.currentCalendarData.chosenDateRange = this.submittedPresetDateRange;
    return this.apply();
  }

  private showDatePicker() {
    this.currentCalendarData = cloneDeep(this.oldCalendarData);
    this.errorMessage = '';
    this.togglePicker(!this.isShowDatePicker);
    this.$nextTick(() => {
      this.scrollTimePresetToElement(`li-${this.currentCalendarData.filterMode}`);
    });
  }

  private startDateSelectedManually(value: Date) {
    if (value) {
      this.errorMessage = '';
      this.selectCompareDateManually();
      this.currentCalendarData.updateCompareRange({
        start: value,
        end: this.currentCalendarData.compareDateRange?.end as Date
      });
    } else {
      this.errorMessage =
        this.calendarClass === 'full-size-container' ? 'The "Start Date" must be less than or equal to the "End Date"!' : 'The "Start Date" is invalid!';
    }
  }

  private endDateSelectedManually(value: Date) {
    if (value) {
      this.errorMessage = '';
      this.selectCompareDateManually();
      this.currentCalendarData.updateCompareRange({
        start: this.currentCalendarData.compareDateRange?.start as Date,
        end: value
      });
    } else {
      this.errorMessage =
        this.calendarClass === 'full-size-container' ? 'The "End Date" must be greater than or equal to the "Start Date"!' : 'The "End Date" is invalid!';
    }
  }

  private datePickerDragged(value: DateRange) {
    if (value === null && this.currentCalendarData.chosenDateRange) {
      this.currentCalendarData.filterMode = MainDateFilterMode.custom;
      const compareRange = DateUtils.getCompareDateRange(this.currentCalendarData.compareMode, this.currentCalendarData.chosenDateRange);
      if (compareRange) {
        this.currentCalendarData.updateCompareRange(compareRange);
      }
    }
  }

  private togglePicker(value: boolean): void {
    this.isShowDatePicker = value;
  }

  private updateDateRange(newDateRange: DateRange | null): void {
    this.errorMessage = '';

    if (newDateRange && newDateRange.start && newDateRange.end) {
      this.currentCalendarData.updateChosenDateRange(newDateRange);
      const compareRange = DateUtils.getCompareDateRange(this.currentCalendarData.compareMode, newDateRange);
      if (compareRange) {
        this.currentCalendarData.updateCompareRange(compareRange);
      }
    } else {
      this.currentCalendarData.showAllTime();
    }
    this.datePicker?.$refs?.calendar.move(this.currentCalendarData.chosenDateRange?.end);
  }

  private selectCompareDateManually() {
    this.currentCalendarData.compareMode = CompareMode.custom;
  }

  private scrollTimePresetToElement(elementId: string) {
    const ulTimePreset = document.getElementById('ulTimePreset');
    const liElement = document.getElementById(elementId);
    if (ulTimePreset && liElement) {
      const bottom = ulTimePreset.scrollTop + ulTimePreset.offsetHeight - liElement.offsetHeight;
      const top = ulTimePreset.scrollTop;
      if (liElement.offsetTop <= top) {
        ulTimePreset.scrollTop = liElement.offsetTop;
      } else if (liElement.offsetTop >= bottom) {
        ulTimePreset.scrollTop = liElement.offsetTop - (ulTimePreset.offsetHeight - liElement.offsetHeight);
      }
    }
  }

  private setActiveForTimePreset(value: MainDateFilterMode) {
    this.currentCalendarData.filterMode = value;
  }

  private isTimePresetSelected(currentItem: TimeOption) {
    return this.currentCalendarData.filterMode == currentItem.value;
  }
}
