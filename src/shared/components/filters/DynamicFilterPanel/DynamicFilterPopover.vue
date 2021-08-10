<template>
  <BPopover
    :show.sync="isShowPopoverSynced"
    :target="btnId"
    container="body"
    custom-class="filter-popover-area"
    :placement="placement"
    ref="popover"
    triggers="manual"
    boundary="window"
  >
    <div v-click-outside="hidePopover">
      <div class="d-flex flex-row align-items-center filter-popover-header">
        <div class="popover-title">Filter {{ filterName }}</div>
        <DiDropdown
          :id="genDropdownId('dynamic-filter')"
          v-show="isShowOptionRangeFilter"
          v-model="filterModeSelected"
          :data="options"
          class="ml-auto dropdown-border"
          labelProps="displayName"
          valueProps="id"
        />
      </div>
      <div class="filter-popover-body">
        <component
          :is="toComponent"
          v-if="toComponent"
          ref="filterRef"
          :defaultOptionSelected="currentOptionSelected"
          :defaultValues="currentValues"
          :profileField="profileField"
          :selectOptions="selectOptions"
        ></component>
        <div v-else>Filter unsupported</div>
      </div>
      <div class="d-flex flex-row align-items-center filter-popover-footer">
        <div :id="genBtnId('dynamic-filter-popover-delete')" class="btn-ghost-alter mr-auto" @click.prevent="handleDeleteFilter">
          <i class="fas fa-trash"></i>
        </div>
        <div class="d-flex flex-row button-bar">
          <button :id="genBtnId('dynamic-filter-popover-cancel')" class="btn btn-ghost mr-2" @click.prevent="hidePopover">Cancel</button>
          <button :id="genBtnId('dynamic-filter-popover-apply')" class="btn btn-primary" @click.prevent="handleApplyFilter">Apply</button>
        </div>
      </div>
    </div>
  </BPopover>
</template>

<script lang="ts" src="./DynamicFilterPopover.ts"></script>
<style lang="scss" scoped src="./dynamic-filter-popover.scss"></style>
