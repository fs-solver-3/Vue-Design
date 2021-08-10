<template>
  <div class="w-100 h-100">
    <template v-if="isTableChart">
      <component
        :is="toTableComponent"
        ref="widget"
        :chartData="response"
        :isPreview="isPreview"
        :querySetting="metaData.setting"
        :tableChartTempId="metaData.id"
      />
    </template>
    <template v-else-if="toComponent">
      <div :key="genBtnId('chart', metaData.id)" class="h-100 w-100 onRow overflow-hidden">
        <div :class="componentClass">
          <component
            :is="toComponent"
            :id="metaData.id"
            ref="widget"
            :backgroundColor="setting.getBackgroundColor()"
            :data="response"
            :isPreview="isPreview"
            :query="metaData.setting"
            :setting="setting"
            :show-edit-component="showEditComponent"
            :subTitle="setting.getSubtitle()"
            :textColor="setting.getTextColor()"
            :title="setting.getTitle()"
          >
          </component>
        </div>
      </div>
    </template>
    <template v-else-if="!toComponent">
      <div>Chart unsupported</div>
    </template>
  </div>
</template>

<script lang="ts" src="./ChartWidget.ts"></script>

<style lang="scss">
@import '~@/themes/scss/mixin.scss';

.onRow {
  display: flex;
  flex-wrap: wrap;
}

.chart-widget-container {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
}

.filter-widget-container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
