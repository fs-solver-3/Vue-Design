<template>
  <VueBlocListener :bloc="settingBloc" @onStateChange="handleOnStateChanged">
    <div class="h-100 w-100 d-inline-block">
      <div class="data-builder">
        <div class="d-flex flex-row data-builder-header">
          <h3 class="cursor-default unselectable">
            Data Builder
          </h3>
          <div class="ml-auto d-flex flex-row align-items-center btn-bar">
            <div :id="genBtnId('data-builder-cancel')" class="btn-ghost-alter align-middle unselectable" @click="handleCancel">
              Cancel
            </div>
            <div
              v-if="isCreateMode"
              :id="genBtnId('data-builder-add')"
              :style="btnStyle"
              class="btn-primary align-middle unselectable"
              @click="handleAddToDashboard"
            >
              Add
            </div>
            <div v-else :id="genBtnId('data-builder-update')" :style="btnStyle" class="btn-primary align-middle unselectable" @click="handleUpdateChart">
              Update
            </div>
          </div>
        </div>
        <div class="d-flex flex-row data-builder-body">
          <DatabaseListing :isDragging.sync="isDragging" class="col-2 database-panel"></DatabaseListing>
          <div class="col-4">
            <div class="row config-filter-area">
              <ConfigPanel :isDragging="isDragging" class="col-12 config-panel"></ConfigPanel>
              <!--            <FilterPanel :isDragging="isDragging" class="col-12 filter-panel"></FilterPanel>-->
            </div>
          </div>
          <VizPanel ref="vizPanel" class="col-6 visualization-panel"></VizPanel>
        </div>
      </div>
      <LocationNormalizeModal :isShow="isShowLocationNormalize"></LocationNormalizeModal>
      <VizSettingModal :ref="settingModal" :isShow="isShowSetting"></VizSettingModal>
      <VisualizeSelectionModal
        title="Select A Visualization"
        sub-title="Select a visualization to start. Don’t worry, you could change it later"
        :isShow.sync="isShowSelection"
        :all-items="allItems"
        @onItemSelected="handleItemSelected"
      ></VisualizeSelectionModal>
    </div>
  </VueBlocListener>
</template>

<script lang="ts" src="./DataBuilder.ts"></script>
<style lang="scss" src="../../DashboardDetail/views/dashboard-theme.scss"></style>
<style lang="scss" scoped src="./data-builder.scss"></style>

<style lang="scss">
body,
html,
#app {
  height: 100% !important;
}
</style>
