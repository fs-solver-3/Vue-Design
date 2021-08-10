<template>
  <div class="data-management-body-content">
    <DatabaseTreeView class="left-panel" :schemas="databaseSchemas" :loading="loadingDatabaseSchemas">
      <template slot="table-item" slot-scope="{ database, table }">
        <a href="#" @click.prevent="selectTable(database, table)" class="table-item">
          <span v-if="table.displayName">{{ table.displayName }}</span>
          <em v-else class="text-muted">{{ table.name }}</em>
        </a>
      </template>
    </DatabaseTreeView>
    <div class="right-panel d-flex flex-column data-schema">
      <div v-if="!model" class="data-management-tips">
        <div class="data-management-tips--icon">
          <i class="di-icon-schema"></i>
        </div>
        <div v-if="error" class="data-management-tips--title text-danger">
          <strong>{{ error }}</strong>
        </div>
        <div v-else class="data-management-tips--title">
          NO SELECTED TABLE!
        </div>
      </div>
      <template v-else>
        <div class="data-schema-header">
          <i class="fa fa-database text-muted"> </i>
          <span class="data-schema-header--dbname"> {{ model.database.displayName }} </span>
          <i class="fa fa-angle-right text-muted"> </i>
          <span class="data-schema-header--tblname"> {{ model.table.displayName }} </span>
        </div>
        <!--    <h1>Data Schema</h1>-->
        <div class="data-schema-info" v-if="model.table">
          <div class="data-schema-title">Table Schema</div>
          <div class="table-container">
            <table class="table table-striped table-sm">
              <thead>
                <tr>
                  <th>Column ({{ model.table.columns.length }})</th>
                  <th>Display name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Default Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(column, idx) in model.table.columns" :key="column.name" :class="[idx % 2 ? 'odd' : 'even']">
                  <td>
                    {{ column.name }}
                  </td>
                  <td>
                    {{ column.displayName }}
                  </td>
                  <td class="text-capitalize">
                    {{ column.className }}
                  </td>
                  <td>
                    <code v-if="column.isNullable">nullable</code>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="data-schema-data">
          <div class="data-schema-title">Table Data</div>
          <div class="table-container">
            <ChartContainer v-if="tableData" class="result-table position-relative" :meta-data="tableData"></ChartContainer>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" src="./DataSchema.ctrl.ts"></script>
<style lang="scss" scoped>
.data-schema {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  text-align: left;

  .data-schema-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .data-schema-header {
    margin-bottom: 20px;
    font-size: 16px;

    .data-schema-header--dbname {
      margin: 0 5px;
      font-weight: 500;
    }

    .data-schema-header--tblname {
      margin: 0 5px;
    }
  }

  .data-schema-info {
    max-height: calc(50% - 50px);
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
  }

  .data-schema-data {
    flex: 1;
  }

  .data-schema-body {
    flex: 1;
  }

  .table {
  }
}
</style>
