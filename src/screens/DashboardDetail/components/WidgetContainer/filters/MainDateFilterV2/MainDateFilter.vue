<template>
  <div class="w-100">
    <DiCalendar
      @onCalendarSelected="handleCalendarSelected"
      :mainDateFilterMode="mainDateFilterMode"
      :isShowResetFilterButton="isShowResetFilterButton"
      :defaultDateRange="defaultDateRange"
    />
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { DateRange } from '@/shared';
import { MainDateFilterMode } from '@core/domain/Model';
import { CalendarData } from '@/shared/models';
import DiCalendar from '@filter/MainDateFilterV2/DiCalendar.vue';
import { DashboardModule } from '@/screens/DashboardDetail/stores/dashboard/DashboardStore';

@Component({
  components: {
    DiCalendar
  }
})
export default class MainDateFilter extends Vue {
  @Prop({ required: true })
  private readonly mainDateFilterMode!: MainDateFilterMode;

  @Prop()
  private readonly defaultDateRange!: DateRange;

  @Prop({ required: true })
  private isShowResetFilterButton!: boolean;

  // Inject from DashboardHeader.vue
  @Inject({ default: undefined })
  private applyMainDateFilter?: (chooseTimeRange: DateRange) => void;

  // Inject from DashboardHeader.vue
  @Inject({ default: undefined })
  private applyCompare?: (firstTime: DateRange, compareRange: DateRange) => void;

  // Inject from DashboardHeader.vue
  @Inject({ default: undefined })
  private applyMainDateAllTime?: () => void;

  private handleCalendarSelected(calendarData: CalendarData) {
    DashboardModule.saveMainDateFilterMode({
      mode: calendarData.filterMode,
      chosenDateRange: calendarData.chosenDateRange
    });
    if (calendarData.isAllTime && this.applyMainDateAllTime) {
      this.applyMainDateAllTime();
    } else if (calendarData.isCompare && this.applyCompare) {
      this.applyCompare(calendarData.chosenDateRange!, calendarData.compareDateRange!);
    } else if (this.applyMainDateFilter) {
      this.applyMainDateFilter(calendarData.chosenDateRange!);
    }
  }
}
</script>

<style lang="scss">
@import '~@/themes/scss/mixin.scss';

.hover {
  cursor: pointer;
}

img.ic-16 {
  margin-right: 8px;
}

.date-input {
  opacity: 0.5;
  @include regular-text;
}
</style>
