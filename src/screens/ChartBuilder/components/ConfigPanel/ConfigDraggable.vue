<template>
  <DropArea
    :allowDrop="canDrop"
    :isDragging="hasDragging"
    :isOptional="config.isOptional"
    :placeholder="config.placeholder"
    :showHelpIcon="showHelpIcon"
    :showPlaceHolder="isShowPlaceHolder"
    :showTitle="showTitle"
    :title="config.title"
    @onDrop="handleDrop"
  >
    <template #drop-area>
      <draggable
        v-model="currentFunctions"
        :animation="100"
        :componentData="config"
        :emptyInsertThreshold="100"
        :group="groupConfig"
        class="draggable"
        :class="{
          placeholder: isShowPlaceHolder
        }"
        draggable=".drag-item"
        @add="handleDropFromOtherSection"
        @end="handleFunctionChanged"
        @start="handleDragItem"
      >
        <DropItem
          v-for="(node, index) in currentFunctions"
          :key="node.id"
          :canInsert="canDrop"
          :index="index"
          :isItemDragging="isItemDragging"
          class="drag-item"
          @onInsert="handleInsertFunction"
          @onReplace="handleReplaceFunction"
        >
          <template #default="{ opacity }">
            <DraggableItem
              :configType="configType"
              :node="node"
              :opacity="opacity"
              @clickFuncFamily="openContext(fnFamilyContext, $event, { node: node, i: index })"
              @clickFuncType="openContext(fnTypeContext, $event, { node: node, i: index })"
              @clickMore="openContext(menu, $event, { node: node, i: index })"
              @clickName="handleClickField(fieldContext, $event, { node: node, i: index })"
              @clickSorting="openContext(sortingContext, $event, { node: node, i: index })"
            >
            </DraggableItem>
          </template>
        </DropItem>
      </draggable>
      <template v-if="isShowPlaceHolder">
        <div class="tutorial-drop">
          <div v-once class="unselectable">{{ config.placeholder }}</div>
        </div>
      </template>
      <template>
        <ConfigModal :node="editingNode" :isOpen.sync="isModalOpen" :subFunctions="subFunctions" :configType="configType" @onSaveConfig="handleSaveConfig">
        </ConfigModal>
        <vue-context ref="menu">
          <template v-if="child.data" slot-scope="child">
            <li>
              <a href="#" @click.prevent="openModal(child.data.node)">Config</a>
            </li>
            <li>
              <a href="#" @click.prevent="removeItem(child.data.i)">Remove</a>
            </li>
          </template>
        </vue-context>
        <vue-context ref="fieldContext">
          <template v-if="child.data" slot-scope="child">
            <StatusWidget :error="errorMessage" :status="fieldContextStatus">
              <div class="context field-context">
                <div v-for="(profileField, i) in profileFields" :key="i" class="active" @click.prevent="handleChangeField(child, profileField)">
                  <li>
                    <a href="#">{{ profileField.displayName }}</a>
                    <span v-if="child.data.node.displayName === profileField.displayName">&#10003;</span>
                  </li>
                </div>
              </div>
            </StatusWidget>
          </template>
        </vue-context>
        <vue-context ref="fnFamilyContext">
          <template v-if="child.data" slot-scope="child">
            <div class="context">
              <div v-for="(func, i) in functions" :key="i" class="active" @click.prevent="handleFunctionFamilyChanged(func, child)">
                <li>
                  <a href="#">{{ func.label }}</a>
                  <span v-if="child.data.node.functionFamily === func.label">&#10003;</span>
                </li>
              </div>
            </div>
          </template>
        </vue-context>
        <vue-context ref="fnTypeContext">
          <template v-if="child.data" slot-scope="child">
            <div class="context">
              <div
                v-for="(subFunc, i) in subFunctionGroups"
                :key="i"
                :class="{ active: subFunc.type !== 'group' }"
                @click.prevent="subFunc.type !== 'group' && handleFunctionTypeChanged(subFunc, child)"
              >
                <div v-if="subFunc.type === 'group'" class="context-menu-group">
                  <span>{{ subFunc.label }}</span>
                </div>
                <div v-else>
                  <div class="active">
                    <li>
                      <a href="#">{{ subFunc.label }}</a>
                      <span v-if="child.data.node.functionType === subFunc.label">&#10003;</span>
                    </li>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </vue-context>
        <vue-context ref="sortingContext">
          <template v-if="child.data" slot-scope="child">
            <div class="context">
              <div v-for="(sort, index) in sorts" :key="index" class="active" @click.prevent="handleSortingChanged(sort, child)">
                <li>
                  <a href="#">{{ sort.label }}</a>
                  <span v-if="child.data.node.sorting === sort.label">&#10003;</span>
                </li>
              </div>
            </div>
          </template>
        </vue-context>
      </template>
    </template>
  </DropArea>
</template>

<script lang="ts" src="./ConfigDraggable.ts"></script>

<style lang="scss" src="./config-draggable.scss"></style>
