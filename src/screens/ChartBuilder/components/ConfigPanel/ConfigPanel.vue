<template>
  <div class="config-area">
    <VisualizationItemListing
      :itemSelected="itemSelected"
      class="type-listing"
      @onItemDragging="handleItemDragging"
      @update:itemSelected="handleItemSelectedChanged"
    />
    <div class="droppable-listing">
      <div class="drop-area-listing">
        <ConfigDraggable
          v-for="config in draggableConfigs"
          :key="buildKey(config.key)"
          :config="config"
          :hasDragging="hasDragging"
          :isShowSorting="false"
          @onItemDragging="handleItemDragging"
        />
        <ConfigDraggable v-if="isShowSorting" :config="sortingConfig" :hasDragging="hasDragging" @onItemDragging="handleItemDragging" />
        <FilterDraggable v-if="isShowFilter" :draggableConfig="filterConfig" :hasDragging="hasDragging" @onItemDragging="handleItemDragging" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./ConfigPanel.ts" />
<style lang="scss" scoped>
.config-area {
  overflow-y: auto;
  padding: 0 16px;

  .type-listing {
    background-color: var(--charcoal-2);
    padding-top: 16px;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .type-listing + .droppable-listing {
    margin-top: 16px;
  }

  .droppable-listing {
    .drop-area-listing {
      margin-bottom: 20px;

      > div + div {
        margin-top: 16px;
      }
    }
  }
}
</style>
