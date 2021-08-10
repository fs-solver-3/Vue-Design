<template>
  <a-popover trigger="click" :placement="placement" :visible="isShowDatePicker" @visibleChange="showDatePicker" :getPopupContainer="container">
    <template slot="content">
      <div :class="calendarClass" :style="timePresetHeight">
        <div class="calendar-container">
          <div class="calendar-container-body">
            <div class="calendar-container-body-left">
              <v-date-picker
                color="blue"
                mode="range"
                isDark
                :maxDate="maxDate"
                :minDate="minDate"
                v-model="currentCalendarData.chosenDateRange"
                is-inline
                is-expanded
                nav-visibility="hidden"
                class="calendar-picker"
                title-position="left"
                @drag="datePickerDragged"
                ref="datePicker"
              >
              </v-date-picker>

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
              <div class="calendar-time-preset">
                <div class="row no-gutters calendar-time-preset-label">
                  <label>Time Present</label>
                </div>
                <div class="row no-gutters calendar-time-preset-ranges">
                  <ul id="ulTimePreset">
                    <li
                      v-for="item in listTimePresetOptions"
                      :id="`li-${item.value}`"
                      :key="item.value"
                      @click="timePresetOptionsSelected(item.value)"
                      class="btn-ghost-alter"
                    >
                      <label>{{ item.label }}</label>
                      <i v-if="isTimePresetSelected(item)" class="fa fa-check" />
                    </li>
                  </ul>
                </div>
                <div class="row no-gutters calendar-margin-top" v-if="!isHiddenCompareToSection" :class="compareClass">
                  <div class="calendar-time-preset-label">
                    <label class="compare-to-label">Compare to:</label>
                  </div>
                  <div class="calendar-time-preset-compare-to">
                    <DiDropdown
                      class="select-chat-list"
                      :data="listCompareToOptions"
                      v-model="currentCalendarData.compareMode"
                      valueProps="value"
                      labelProps="label"
                      @change="ddlCompareToChanged"
                    />
                  </div>
                </div>
                <div class="row no-gutters calendar-margin-top" v-if="!isHiddenCompareToSection" :class="compareClass">
                  <v-date-picker
                    v-model="currentCalendarData.compareDateRange.start"
                    color="blue"
                    isDark
                    class="calendar-time-preset-input"
                    :maxDate="currentCalendarData.compareDateRange.end || maxDate"
                    :masks="{
                      input: ['DD/MM/YYYY']
                    }"
                    @input="startDateSelectedManually"
                    :popover="{ visibility: 'hidden' }"
                    :inputDebounce="1000"
                    :updateOnInput="true"
                  />
                  <div class="calendar-dash">
                    <b-icon-dash />
                  </div>
                  <v-date-picker
                    v-model="currentCalendarData.compareDateRange.end"
                    color="blue"
                    isDark
                    class="calendar-time-preset-input"
                    :maxDate="maxDate"
                    :minDate="currentCalendarData.compareDateRange.start"
                    :masks="{ input: ['DD/MM/YYYY'] }"
                    @input="endDateSelectedManually"
                    :popover="{ visibility: 'hidden' }"
                    :inputDebounce="1000"
                    :updateOnInput="true"
                  />
                </div>
              </div>
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
        :masks="{ input: ['MMM D, YYYY'] }"
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
@import '~@/themes/scss/calendar/di-calendar.scss';

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
