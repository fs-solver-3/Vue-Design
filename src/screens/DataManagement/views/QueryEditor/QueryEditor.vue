<template>
  <div class="data-management-body-content">
    <DatabaseTreeView class="left-panel" :schemas="databaseSchemas" :loading="loadingDatabaseSchemas" show-columns>
      <template slot="header-action">
        <a @click.prevent="showCreateDatabaseModal" href="#" class="mr-3">
          <img alt="New user" class="icon-title" src="@/assets/icon/ic_add.svg" width="14" height="14" style="margin-top: -2px" />
        </a>
        <!--        <DiButton @click="showCreateDatabaseModal" :id="genBtnId('create-database')" class="col-auto btn-transparent">-->
        <!--          <img alt="New user" class="icon-title" src="@/assets/icon/ic_add.svg" />-->
        <!--        </DiButton>-->
      </template>
      <template slot="table-item" slot-scope="{ database, table, toggleTable, isExpandedTable }">
        <div @click.prevent="toggleTable(database, table)" class="table-item">
          <i class="table-icon fa fa-caret-right text-muted" :class="{ 'fa-rotate-90': isExpandedTable(database, table) }"></i>
          <span v-if="table.displayName" class="table-name">{{ table.displayName }}</span>
          <em v-else class="text-muted table-name">{{ table.name }}</em>
          <a @click.prevent.stop="e => showTableContextMenu(e, table)" href="#" class="ml-auto">
            <img src="@/assets/icon/charts/ic_more.svg" alt="" width="12" height="12" />
          </a>
        </div>
      </template>
      <template slot="column-item" slot-scope="{ table, column, getColumnIcon }">
        <div class="column-item" @contextmenu="e => showColumnContextMenu(e, table, column)">
          <img :src="require(`@/assets/icon/${getColumnIcon(column)}`)" class="column-icon" />
          <div class="column-name">
            <span v-if="column.displayName">
              {{ column.displayName }}
            </span>
            <em v-else class="text-muted">{{ column.name }}</em>
          </div>
        </div>
      </template>
    </DatabaseTreeView>
    <div class="right-panel d-flex flex-column data-schema">
      <div v-if="loadingDatabaseSchemas" class="data-management-tips">
        <div class="data-management-tips--icon">
          <i class="di-icon-query-editor"></i>
        </div>
        <div class="data-management-tips--title">
          LOADING DATA...
        </div>
      </div>
      <template v-else>
        <div class="formula-completion-input">
          <div class="padding-top"></div>
          <FormulaCompletionInput
            class="query-input"
            v-if="formulaController"
            :formula.sync="query"
            :formulaController="formulaController"
            @onExecute="handleQuery"
          />
        </div>
        <div class="row-limit-container d-flex justify-content-between align-items-center">
          <div class="d-flex row-limit"></div>
          <div class="d-flex">
            <DiButton
              :id="genBtnId('create-table-form-query')"
              class="btn-ghost-alter"
              title="Create Table From This Query"
              @click="showCreateModal"
            ></DiButton>
            <button :id="genBtnId('query')" class="btn-query btn-primary" @click="handleQuery">Query</button>
          </div>
        </div>
        <div v-if="isShowTable" class="query-result d-flex flex-column text-left flex-grow-1">
          <div class="result">Result</div>
          <div class="table-container flex-grow-1">
            <ChartContainer class="result-table position-relative" :meta-data="tableChartInfo"></ChartContainer>
          </div>
        </div>
      </template>
    </div>
    <TableCreationFromQueryModal ref="tableCreationModal" :query="query"></TableCreationFromQueryModal>
    <DatabaseCreationModal ref="databaseCreationModal"></DatabaseCreationModal>
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
<script lang="ts" src="./QueryEditor.ctrl.ts"></script>
<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';
.formula-completion-input {
  height: 30% !important;
  background-color: #333645;
  border-radius: 4px;

  .padding-top {
    height: 16px;
  }

  .query-input {
    height: calc(100% - 16px) !important;

    ::v-deep {
      .view-lines {
        text-align: left;
        border-radius: 0;
      }

      .overflow-guard {
        border-radius: 4px;
      }

      .monaco-editor {
        border-radius: 4px;
      }
    }
  }
}
.row-limit-container {
  margin-top: 16px;

  .row-limit {
    font-size: 16px;
  }
}

.btn-query {
  margin-left: 16px;
  width: 122px;
  height: 42px;
}

.select-per-page-list {
  ::v-deep {
    input {
      width: 40px;
    }
  }
}

.result {
  @include bold-text();
  font-size: 16px;
  margin-top: 27px;
  margin-bottom: 16px;
}
</style>
