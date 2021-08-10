/*
 * @author: tvc12 - Thien Vi
 * @created: 12/31/20, 10:44 AM
 */

import { Component, Inject, Prop, PropSync, Vue, Watch } from 'vue-property-decorator';
import moment from 'moment';
import { DateRange, FilterSelectOption, InputType } from '@/shared';
import DiCalendar from '@/shared/components/DiCalendar.vue';
import { MainDateFilterMode } from '@core/domain/Model';
import { CalendarData } from '@/shared/models';
import { FormatDateTime, ListUtils } from '@/utils';

@Component({
  components: { DiCalendar }
})
export default class SelectionInput extends Vue {
  @Prop({ type: Array, default: () => [] })
  options!: FilterSelectOption[];

  @PropSync('optionSelected', { type: String, default: '' })
  optionSelectedProp!: string;

  @PropSync('values', { type: Array, default: '' })
  valuesProp!: string[];

  private get valueProp(): string {
    return this.valuesProp[0];
  }

  private set valueProp(newValue: string) {
    this.valuesProp.splice(0, 1, newValue);
  }

  private get selectedDate(): Date | null {
    if (this.valueProp) {
      return moment(this.valueProp).toDate();
    } else {
      return null;
    }
  }

  private set selectedDate(newDate: Date | null) {
    if (newDate) {
      this.valueProp = FormatDateTime.formatDate(newDate);
    } else {
      this.valueProp = '';
    }
  }

  private currentSelected: FilterSelectOption | null = null;

  @Watch('optionSelectedProp', { immediate: true })
  onOptionSelectedChanged() {
    this.currentSelected = this.options.find(option => option.id === this.optionSelectedProp) ?? null;
  }

  private get selectClass(): string {
    if (this.isDate || this.isText || this.isDateRange) {
      return 'pl-0 col-8';
    } else {
      return 'px-0 col-12';
    }
  }

  private get isText(): boolean {
    return this.currentSelected?.inputType == InputType.text;
  }

  private get isDate(): boolean {
    return this.currentSelected?.inputType == InputType.date;
  }

  private get isDateRange(): boolean {
    return this.currentSelected?.inputType == InputType.dateRange;
  }

  //TODO inject from DynamicFilterPanel.ts
  @Inject()
  private handleApplyFilter!: () => void;

  private applyFilter(): void {
    this.handleApplyFilter();
  }

  private parentElement(): Element {
    return this.$el;
  }

  private get defaultDateRange(): DateRange | undefined {
    if (ListUtils.isNotEmpty(this.valuesProp)) {
      return {
        start: moment(this.valuesProp[0]).toDate(),
        end: moment(this.valuesProp[1]).toDate()
      };
    } else {
      return void 0;
    }
  }

  private get mainDateFilterMode(): MainDateFilterMode {
    if (this.defaultDateRange) {
      return MainDateFilterMode.custom;
    } else {
      return MainDateFilterMode.allTime;
    }
  }

  private handleCalendarSelected(calendarData: CalendarData) {
    switch (calendarData.filterMode) {
      case MainDateFilterMode.allTime:
        this.valuesProp = [];
        break;
      default:
        if (calendarData.chosenDateRange) {
          this.valuesProp = [FormatDateTime.formatDate(calendarData.chosenDateRange.start), FormatDateTime.formatDate(calendarData.chosenDateRange.end)];
        } else {
          this.valuesProp = [];
        }
    }
  }
}
