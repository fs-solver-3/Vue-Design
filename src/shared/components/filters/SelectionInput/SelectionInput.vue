<template>
  <div class="d-flex flex-row align-items-center select-input-area col-12 w-100 p-0">
    <DiDropdown
      :id="genDropdownId('filter')"
      :class="selectClass"
      class="p-0 mr-3"
      :data="options"
      value-props="id"
      label-props="displayName"
      v-model="optionSelectedProp"
      boundary="viewport"
    ></DiDropdown>
    <div v-if="currentSelected" class="input-container">
      <BInput :id="genInputId('filter-value')" v-model="valueProp" v-if="isText" class="input-form" @keydown.enter="applyFilter"></BInput>
      <v-date-picker
        v-model="selectedDate"
        color="blue"
        isDark
        :masks="{ input: ['DD/MM/YYYY'] }"
        v-if="isDate"
        nav-visibility="hidden"
        :inputDebounce="1000"
        :updateOnInput="true"
        title-position="left"
        :popover="{ visibility: 'focus', placement: 'auto' }"
      >
        <template v-slot="{ inputValue, inputEvents }">
          <input id="date" class="input-calendar" autocomplete="off" :value="inputValue" v-on="inputEvents" @keyup.enter="handleApplyFilter" />
        </template>
      </v-date-picker>
      <DiCalendar
        v-if="isDateRange"
        :isHiddenCompareToSection="true"
        :container="parentElement"
        :isShowResetFilterButton="false"
        :mainDateFilterMode="mainDateFilterMode"
        :defaultDateRange="defaultDateRange"
        applyTextButton="Ok"
        placement="bottomLeft"
        @onCalendarSelected="handleCalendarSelected"
      >
      </DiCalendar>
    </div>
  </div>
</template>

<script lang="ts" src="./SelectionInput.ts"></script>
<style lang="scss" scoped src="./selection-input.scss"></style>
