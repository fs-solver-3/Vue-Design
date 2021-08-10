<template>
  <div v-b-hover="handleHover" class="w-100 h-100 position-relative" :style="{ backgroundColor: backgroundColor }">
    <StatusWidget :class="chartWidgetClass" :error="errorMessage" :renderWhen="renderWhen" :status="status" @retry="retryLoadData">
      <template #default>
        <template v-if="hasData">
          <CaptureException name="chart" @onError="handleChartRenderError">
            <ChartWidget
              :id="metaData.id"
              :key="metaData.id"
              ref="chartWidget"
              :meta-data="metaData"
              :response="response"
              :show-edit-component="showEditComponent"
              @hook:mounted="handleOnRendered"
            >
            </ChartWidget>
          </CaptureException>
        </template>
        <template v-else>
          <EmptyWidget :key="`testing-${metaData.id}`"></EmptyWidget>
        </template>
      </template>
    </StatusWidget>
    <div class="widget-action d-flex flex-row">
      <template>
        <template v-if="isFullSizeMode">
          <ActionWidgetFilter
            v-if="hasFilter()"
            :id="genBtnId('filter-full-mode', metaData.id)"
            :filter-requests="getFilterRequests()"
            :is-apply-filter="isAffectByFilter()"
          />
          <ActionWidgetMore
            v-if="enableMoreAction"
            :id="genBtnId('more-action-full-mode', metaData.id)"
            :dashboardMode="dashboardMode"
            :drilldownId="genBtnId('drilldown-full-mode', metaData.id)"
            :meta-data="metaData"
            :zoomId="genBtnId('zoom-full-mode', metaData.id)"
          />
          <img
            :id="genBtnId('hide-full-mode', metaData.id)"
            alt="Minimize Screen"
            class="icon-title di-popup ic-40 cursor-pointer btn-ghost-alter"
            src="@/assets/icon/ic_minimize.svg"
            @click="hideFullSize"
          />
        </template>
        <template v-else>
          <ActionWidgetFilter
            v-if="hasFilter()"
            :id="genBtnId('filter', metaData.id)"
            :filter-requests="getFilterRequests()"
            :is-apply-filter="isAffectByFilter()"
          />
          <ActionWidgetMore
            v-if="enableMoreAction"
            :id="genBtnId('more-action', metaData.id)"
            :dashboardMode="dashboardMode"
            :drilldownId="genBtnId('drilldown', metaData.id)"
            :meta-data="metaData"
            :zoomId="genBtnId('zoom', metaData.id)"
          />
          <img
            v-if="canShowFullScreen"
            :id="genBtnId('hide', metaData.id)"
            alt="Full Screen"
            class="icon-title di-popup ic-40 cursor-pointer btn-ghost-alter"
            src="@/assets/icon/ic-full-screen.svg"
            @click="showFullSize"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" src="./ChartContainer.ts"></script>

<style lang="scss" src="./chart-container.scss" scoped></style>
