<template>
  <div class="sl-vue-tree" :class="{ 'sl-vue-tree-root': isRoot }">
    <div ref="nodes" class="sl-vue-tree-nodes-list">
      <div class="sl-vue-tree-node" v-for="(node, nodeInd) in nodes" :key="nodeInd" :class="{ 'sl-vue-tree-selected': node.isSelected }">
        <div
          class="sl-vue-tree-cursor sl-vue-tree-cursor_before"
          @dragover.prevent
          :style="{
            visibility: cursorPosition && cursorPosition.node.pathStr === node.pathStr && cursorPosition.placement === 'before' ? 'visible' : 'hidden',
            '--depth': depth
          }"
        ></div>
        <div
          class="sl-vue-tree-node-item btn-ghost"
          @contextmenu="emitNodeContextmenu(node, $event)"
          @dblclick="emitNodeDblclick(node, $event)"
          @click="
            emitNodeClick(node, $event);
            onToggleHandler($event, node);
          "
          :path="node.pathStr"
          :class="{
            'sl-vue-tree-cursor-hover': cursorPosition && cursorPosition.node.pathStr === node.pathStr,

            'sl-vue-tree-cursor-inside': cursorPosition && cursorPosition.placement === 'inside' && cursorPosition.node.pathStr === node.pathStr,
            'sl-vue-tree-node-is-leaf': node.isLeaf,
            'sl-vue-tree-node-is-folder': !node.isLeaf
          }"
        >
          <div class="sl-vue-tree-gap" v-for="gapInd in gaps" :key="gapInd"></div>

          <div class="sl-vue-tree-branch" v-if="level && showBranches">
            <slot name="branch" :node="node">
              <span v-if="!node.isLastChild"> {{ String.fromCharCode(0x251c) }}{{ String.fromCharCode(0x2500) }}&nbsp; </span>
              <span v-if="node.isLastChild"> {{ String.fromCharCode(0x2514) }}{{ String.fromCharCode(0x2500) }}&nbsp; </span>
            </slot>
          </div>

          <div class="sl-vue-tree-title" @contextmenu="handleRightClick(node, ...arguments)">
            <drag
              v-b-tooltip.hover.ds1000
              :transfer-data="{ node }"
              :draggable="node.isLeaf"
              :image-x-offset="100"
              :image-y-offset="25"
              :title="node.title"
              @dragstart="handleDragStart"
              @dragend="handleDragEnd"
            >
              <div slot="image" class="drag-image">
                <div class="drag-move" />
                <img :src="require(`@/assets/icon/${node.icon}`)" v-if="node.icon" alt="icon" />
                <span>{{ node.title }}</span>
              </div>
              <span class="sl-vue-tree-toggle" v-if="!node.isLeaf">
                <slot name="toggle" :node="node">
                  <span>
                    <i class="fa fa-caret-down" v-if="node.isExpanded"></i>
                    <i class="fa fa-caret-right" v-else></i>
                  </span>
                </slot>
              </span>
              <img :src="require(`@/assets/icon/${node.icon}`)" v-if="node.icon" alt="icon" />
              <span>
                <slot name="title" :node="node">{{ node.title }}</slot>
              </span>

              <slot name="empty-node" :node="node" v-if="!node.isLeaf && node.children.length === 0 && node.isExpanded"></slot>
            </drag>
          </div>
          <div class="sl-vue-tree-sidebar">
            <slot name="sidebar" :node="node"></slot>
          </div>
        </div>

        <sl-vue-tree
          v-if="node.children && node.children.length && node.isExpanded"
          :value="node.children"
          :level="node.level"
          :parentInd="nodeInd"
          :allowMultiselect="allowMultiselect"
          :allowToggleBranch="allowToggleBranch"
          :edgeSize="edgeSize"
          :showBranches="showBranches"
          @onDragstartitem="handleDragStart"
          @onDragEndItem="handleDragEnd"
          @onRightClick="handleRightClick"
        >
        </sl-vue-tree>

        <div
          class="sl-vue-tree-cursor sl-vue-tree-cursor_after"
          @dragover.prevent
          :style="{
            visibility: cursorPosition && cursorPosition.node.pathStr === node.pathStr && cursorPosition.placement === 'after' ? 'visible' : 'hidden',
            '--depth': depth
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script src="./SlVueTree.js"></script>

<style scoped>
@import './SlVueTreeDark.css';
@import './SlVueTreeMinimal.css';
</style>
