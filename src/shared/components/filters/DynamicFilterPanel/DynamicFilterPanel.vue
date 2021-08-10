<template>
  <div>
    <div class="d-flex flex-row view-panel" :style="viewPanelStyle" :id="btnId">
      <div class="d-flex flex-row display-group" :class="{ disabled: isDisable }">
        <slot name="conditionName">
          <div class="display-name">{{ filterName }}</div>
        </slot>
        <div class="mx-1 display-filter-type text-nowrap">{{ displayFilterType }}</div>
        <div class="listing-filter-area">
          <ChipListing
            v-if="isShowTagListing"
            :listChipData="listChipData"
            @removeAt="handleRemoveChipAt"
            @onChipClicked="showPopover"
            :maxChipShowing="maxChipShowing"
          ></ChipListing>
          <div class="btn-link btn-filter unselectable text-nowrap" @click="showPopover" v-else>
            Click to filter
          </div>
        </div>
      </div>
      <div class="d-flex flex-row align-items-center icon-group cursor-pointer" @click.prevent="toggleEnableFilter" v-if="isShowDisable">
        <img src="~@/assets/icon/ic_eye.svg" alt="open" :key="'open'" v-if="isEnable" />
        <img src="~@/assets/icon/ic_eye_close.svg" alt="close" :key="'close'" v-else />
      </div>
    </div>
    <DynamicFilterPopover
      :btnId="btnId"
      :dynamicFilter="dynamicFilter"
      :isShowPopover.sync="isShowPopover"
      @onApplyFilter="handleApplyFilter"
      @onRemove="handleDeleteFilter"
      :placement="placement"
    >
    </DynamicFilterPopover>
  </div>
</template>

<script lang="ts" src="./DynamicFilterPanel.ts"></script>
<style lang="scss" src="./dynamic-filter-panel.scss" scoped />
