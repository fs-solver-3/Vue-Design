<template>
  <a-popover trigger="click" :placement="placement" :visible="isShowDatePicker" @visibleChange="showDatePicker" :getPopupContainer="container">
    <template slot="content">
      <div :class="calendarClass" :style="timePresetHeight">
        <div class="calendar-container">
          <!--          <div class="compare-container">-->
          <!--            <div class="style"></div>-->
          <!--            <span class="compare d-flex">-->
          <!--              <b-form-checkbox>Include today</b-form-checkbox>-->
          <!--              <DiDropdown-->
          <!--                :id="genDropdownId('default-time-range')"-->
          <!--                v-model="currentCalendarData.filterMode"-->
          <!--                :data="listTimePresetOptions"-->
          <!--                valueProps="value"-->
          <!--                labelProps="label"-->
          <!--                @change="timePresetOptionsSelected"-->
          <!--                placeholder="Select date range"-->
          <!--              >-->
          <!--              </DiDropdown>-->
          <!--            </span>-->
          <!--          </div>-->
          <div class="calendar-container-body">
            <div class="calendar-container-body-left">
              <div class="title-container">
                <div class="style"></div>
                <span class="title">Start Date</span>
              </div>

              <v-calendar
                color="blue"
                isDark
                :maxDate="currentCalendarData.chosenDateRange.end"
                :from-date="currentCalendarData.chosenDateRange.start"
                :minDate="minDate"
                v-model="currentCalendarData.chosenDateRange.start"
                :attributes="startAttributes"
                is-inline
                is-expanded
                class="calendar-picker"
                @dayclick="handleSelectStartTime"
                ref="datePicker"
              >
              </v-calendar>

              <DiButton
                :id="genBtnId('reset-main-date-filter')"
                v-if="isShowResetFilterButton"
                title="Re Setup Main Date"
                @click="handleResetMainDateFilter"
                class="btn-reset-main-date"
              >
                <img src="@/assets/icon/ic_setting.svg" alt="" />
              </DiButton>
            </div>
            <div class="calendar-container-body-right">
              <div class="title-container">
                <div class="style"></div>
                <span class="title">End Date</span>
              </div>
              <v-calendar
                color="blue"
                mode="date"
                isDark
                :from-date="currentCalendarData.chosenDateRange.end"
                :maxDate="maxDate"
                :minDate="currentCalendarData.chosenDateRange.start"
                :attributes="endAttributes"
                v-model="currentCalendarData.chosenDateRange.end"
                @dayclick="handleSelectEndTime"
                is-inline
                is-expanded
                class="calendar-picker"
                ref="datePicker"
              >
                <!--                @drag="datePickerDragged"-->
              </v-calendar>
            </div>
          </div>
          <div class="calendar-container-footer">
            <div class="calendar-container-footer-left fix-height-for-small-size">
              <p class="error-message" v-if="errorMessage">
                {{ errorMessage }}
              </p>
            </div>
            <div class="calendar-container-footer-right">
              <b-button :id="genBtnId('di-calender-cancel')" class="calendar-button" variant="secondary" @click="cancel">
                Cancel
              </b-button>
              <b-button
                :id="genBtnId('di-calender-apply')"
                class="calendar-button calendar-button-right"
                variant="primary"
                @click="apply"
                :disabled="isDisabledApplyButton"
              >
                {{ applyTextButton }}
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div class="di-calendar-input-container btn-ghost-alter">
      <img class="icon-title" src="@/assets/icon/ic_calendar.svg" alt />
      <v-date-picker
        mode="range"
        isDark
        :maxDate="maxDate"
        :minDate="minDate"
        v-model="submittedPresetDateRange"
        :masks="{ input: ['DD/MM/YYYY'] }"
        @input="submittedDateRangeChanged"
        :popover="{
          visibility: 'hidden'
        }"
        :inputDebounce="1000"
        :updateOnInput="true"
        ref="datePickerInput"
      >
        <input
          id="date"
          slot-scope="{ inputProps, inputEvents }"
          class="input-calendar"
          autocomplete="off"
          v-bind="inputProps"
          v-on="inputEvents"
          placeholder="All Time"
          style="cursor: pointer"
        />
      </v-date-picker>
    </div>
  </a-popover>
</template>

<script lang="ts" src="./DiCalendar.ts" />

<style lang="scss" scoped>
@import '~@/themes/scss/calendar/new-di-calender.scss';

.disable-compare {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.5;
}
</style>

<style lang="scss">
@import '~@/themes/scss/mixin.scss';

.ant-popover-inner {
  background-color: var(--primary);
  border-radius: 4px;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 4px 0 rgba(0, 0, 0, 0.16);
}

.ant-popover-placement-bottom,
.ant-popover-placement-bottomLeft,
.ant-popover-placement-bottomRight {
  padding-top: 5px;
}

.ant-popover-arrow {
  display: none;
}

.ant-popover-inner-content {
  padding: 0px;
}

.di-calendar-input-container {
  display: flex;
  flex-direction: row;
  padding-right: 8px;

  img {
    order: 0;
    margin: 0px 8px;
    opacity: var(--normal-opacity);
  }

  &:hover {
    img {
      cursor: pointer;
      opacity: var(--active-opacity);
    }
    .input-calendar {
      opacity: var(--active-opacity);
    }
  }

  .input-calendar {
    @include regular-text;
    order: 1;
    width: 180px;
    letter-spacing: 0.2px;
    color: var(--text-color);
    font-size: 14px;
    height: 37px;
    //background-color: var(--primary);
    background-color: transparent;
    border: transparent;
    opacity: 0.5;
    text-align: center;
    margin-left: 8px;
  }

  input::placeholder {
    color: var(--text-color) !important;
  }
}

.btn-reset-main-date {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: rgba(255, 255, 255, 1);
  opacity: unset;

  img {
    padding-right: 4px;
    color: #fff;
  }

  &:hover {
    color: #fff;
  }
}
</style>
