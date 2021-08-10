<template>
  <b-container :style="dashboardStyle" fluid="*">
    <DiGridstack ref="gridstack" :canInteractive="enableEdit" :options="defaultOptions">
      <template v-for="(position, id) in positions">
        <DiGridstackItem
          :id="+id"
          :key="id"
          :height="position.height"
          :width="position.width"
          :x="position.column"
          :y="position.row"
          :zIndex="position.zIndex"
          @change="handleChangePosition"
          @onClick="handleClickItem(id, position)"
        >
          <div :style="{ cursor: getCurrentCursor }" class="h-100 w-100">
            <WidgetContainer :isShowEdit="isEditMode" :widget="getWidget(id)" />
          </div>
        </DiGridstackItem>
      </template>
    </DiGridstack>
    <WidgetContextMenu ref="widgetContextMenu"></WidgetContextMenu>
  </b-container>
</template>

<script lang="ts" src="./Dashboard.ts" />
<style lang="scss" scoped>
@import '~@/themes/scss/di-variables.scss';
@import '~@/themes/scss/custom-vue-context.scss';

.widget-blur {
  background-color: $widgetColor;
  border-radius: 4px;
}

.dashboard {
  margin: -15px;
}

.ui-draggable-dragging {
  z-index: var(--next-max-z-index) !important;
}
</style>
