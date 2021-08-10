<template>
  <div class="d-flex flex-column database-listing">
    <div class="header-bar d-flex justify-content-between align-items-center">
      <label v-if="!enableSearch" class="unselectable">Database</label>
      <div v-if="enableSearch" class="d-flex w-100">
        <b-input
          :id="genInputId('search-database-columns')"
          class="search-input position-relative w-100 "
          v-model="keyword"
          placeholder="Search columns"
          :debounce="200"
          autocomplete="off"
          @blur="handleUnFocus"
          ref="searchInput"
          autofocus
          trim
        />
        <img
          v-if="isShowClearSearchButton"
          class="close-search-btn position-absolute btn-ghost"
          src="@/assets/icon/ic_close.svg"
          alt=""
          @click="handleClearSearchInput"
        />
      </div>
      <div v-else class="btn-ghost search-btn" @click="toggleSearch">
        <img src="@/assets/icon/ic_search.svg" />
      </div>
    </div>

    <div class="database-selector">
      <DiDropdown
        canHideOtherPopup
        :id="genDropdownId('databases')"
        v-model="databaseSelected"
        :data="databaseInfos"
        labelProps="displayName"
        placeholder="Select database"
        valueProps="name"
      >
      </DiDropdown>
    </div>
    <vuescroll :ops="options" class="schema-listing">
      <div class="nav-scroll">
        <ul class="nav">
          <SlVueTree
            :value="tableSchemas"
            draggable="false"
            @onDragEndItem="handleDragEnd"
            @onDragstartitem="handleDragStart"
            @onRightClick="handleRightClickNode"
          >
            <template #title="{node}">
              <div class="d-inline">
                {{ node.title }}
                <template v-if="!node.isLeaf">
                  <div class="icon-create-field btn-ghost-alter" @click="showMoreOption(node, ...arguments)">
                    <img alt="create field" src="@/assets/icon/charts/ic_more.svg" />
                  </div>
                </template>
              </div>
            </template>
          </SlVueTree>
        </ul>
      </div>
    </vuescroll>
    <CalculatedFieldModal ref="calculatedFieldModal" />
    <VueContext ref="tableMenu" id="table-config">
      <template slot-scope="{ data }">
        <DataListing class="my-2" :records="tableActions" @onClick="handleConfigTable(data.tableSchema, ...arguments)"></DataListing>
      </template>
    </VueContext>
    <VueContext ref="columnMenu" id="column-config">
      <template slot-scope="{ data }">
        <DataListing class="my-2" :records="fieldOptions" @onClick="handleConfigColumn(data.tableSchema, data.column, ...arguments)"></DataListing>
      </template>
    </VueContext>
  </div>
</template>

<script lang="ts" src="./DatabaseListing.ts"></script>
<style lang="scss" scoped src="./database-listing.scss"></style>
