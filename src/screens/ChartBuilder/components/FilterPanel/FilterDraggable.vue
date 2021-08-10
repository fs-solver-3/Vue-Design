<template>
  <div class="filter-draggable-area">
    <DropArea
      :key="draggableConfig.key"
      :is-optional="draggableConfig.isOptional"
      :isDragging="hasDragging"
      :placeholder="draggableConfig.placeholder"
      :show-title="showTitle"
      :showPlaceHolder="canShowPlaceHolder"
      :title="draggableConfig.title"
      @onDrop="handleDropOrGroup"
    >
      <template #drop-area>
        <draggable
          :animation="100"
          :emptyInsertThreshold="100"
          :group="orGroupConfig"
          :value="[]"
          draggable=".filter-content-area .items"
          @input="handleAddNewGroupFromOtherSection"
          @add="handleAddNewGroupFromFilterSection"
        >
          <div class="filter-content-area">
            <div v-for="(andGroup, groupIndex) in conditions" :key="groupIndex" class="filter-group">
              <div class="items" :class="{ 'over-and': hasDragging }">
                <draggable
                  :animation="100"
                  :componentData="{ group: andGroup, groupIndex: groupIndex }"
                  :emptyInsertThreshold="100"
                  :group="andGroupConfig"
                  :value="[]"
                  @add="handleNewConditionFromFilterSection(andGroup, groupIndex, ...arguments)"
                  @change="handleChangeCondition(andGroup, groupIndex, ...arguments)"
                  @start="emitItemDragging(true)"
                  @end="emitItemDragging(false)"
                >
                  <DropItem
                    v-for="(node, nodeIndex) in andGroup"
                    :key="node.id"
                    :can-replace="true"
                    :index="nodeIndex"
                    :isItemDragging="isItemDragging"
                    @onInsert="handleInsertCondition(andGroup, true, ...arguments)"
                    @onReplace="handleReplaceCondition(andGroup, ...arguments)"
                  >
                    <template #default="{ opacity }">
                      <FilterItem
                        :andGroup="andGroup"
                        :conditionTreeNode="node"
                        :filterId="genFilterId(node.groupId, node.id)"
                        :group-index="groupIndex"
                        :node-index="nodeIndex"
                        :opacity="opacity"
                        @onClickFilter="showFilter"
                        @onDeleteFilter="handleDeleteFilter"
                        @onFilterChanged="handleOnFilterChanged"
                        @onOpenMenu="handleOpenMenu"
                      >
                      </FilterItem>
                    </template>
                  </DropItem>
                </draggable>
                <CollapseTransition>
                  <Drop v-if="hasDragging" class="gap-or pb-2" @drop="handleDropAndGroup(andGroup, ...arguments)">
                    Add filter
                  </Drop>
                </CollapseTransition>
                <label class="drop-and-label">AND</label>
              </div>
              <div class="gap-or">Or</div>
            </div>
            <div v-if="hasDragging" class="gap-or"></div>
          </div>
          <template #footer>
            <div v-if="canShowPlaceHolder" class="tutorial-drop">
              <div v-once class="unselectable">{{ draggableConfig.placeholder }}</div>
            </div>
          </template>
        </draggable>
      </template>
    </DropArea>
    <vue-context ref="menu">
      <template v-if="child.data" slot-scope="child">
        <li>
          <a href="#" @click="handleConfigFilter(child.data)">Config</a>
        </li>
        <li>
          <a href="#" @click.prevent="handleDeleteFilter([child.data.i, child.data.j])">Remove</a>
        </li>
      </template>
    </vue-context>
  </div>
</template>

<script lang="ts" src="./FilterDraggable.ts"></script>

<style lang="scss" scoped>
@import '~@/themes/scss/di-variables.scss';
@import '~@/themes/scss/mixin.scss';

.filter-draggable-area {
  color: var(--white);

  .filter-content-area {
    .gap-or {
      color: rgba($white, 0.5);
      font-size: 14px;
      margin-right: 20px;
      text-align: center;
    }

    // disable last child have OR
    .filter-group:last-child .gap-or {
      display: none;
    }

    .filter-group {
      margin: 8px;
    }

    .items {
      background-color: var(--secondary);
      border-radius: 4px;

      margin: 8px 0;
      padding: 0;
      position: relative;
      width: 100%;

      .drop-and-label {
        background-color: var(--accent);
        border-radius: 0 4px;
        display: none;
        font-size: 14px;
        font-weight: lighter;
        padding: 6px 8px;
        position: absolute;
        right: 0;
        top: 0;
      }

      .item-name {
        margin-right: 0.5em;
      }

      .display-name {
        @include bold-text();
        font-size: 14px;
        margin: 0;
        padding: 0 4px;
        text-decoration: underline;
      }
    }

    .over-and {
      border-color: var(--accent);

      .drop-and-label {
        display: block;
      }
    }

    label,
    a {
      color: white;
      font-size: 14px;
      letter-spacing: 0.2px;
    }

    .menu-options {
      background-color: var(--primary);
      border-radius: 5px;
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
      color: white;
      font-size: 14px;
      letter-spacing: 0.2px;
      padding: 5px 15px;
      position: absolute;
      right: 50px;
      width: 80px;

      .menu-item div {
        line-height: 2.5;
      }
    }

    .item-name {
      font-weight: bold;
    }
  }
}

.drop-or {
  height: calc(100% - 35px);
}

p {
  color: white;
  font-weight: bold;
}
</style>
