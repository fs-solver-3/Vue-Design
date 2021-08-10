<template>
  <div class="data-management-container">
    <HeaderBar></HeaderBar>
    <div class="data-management-body">
      <DataManagementHeader></DataManagementHeader>
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Provide, ProvideReactive, Vue } from 'vue-property-decorator';
import HeaderBar from '@/shared/components/HeaderBar.vue';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import DataManagementHeader from '@/screens/DataManagement/components/DataManagementHeader.vue';
import { FormulaController } from '@/shared/fomula/FormulaController';
import { DatabaseSchema } from '@core/domain/Model';
import DataComponents from '@/screens/DataManagement/components/data_component';
import { LoggedInScreen } from '@/shared/components/VueHook/LoggedInScreen';

Vue.use(DataComponents);

@Component({
  components: {
    DataManagementHeader,
    HeaderBar
  }
})
export default class DataManagement extends LoggedInScreen {
  private initedDatabaseSchemasCallbacks: Function[] = [];
  private initedDatabaseSchemas = false;

  @ProvideReactive('loadingDatabaseSchemas')
  private loadingDatabaseSchemas = false;

  @Provide('onInitedDatabaseSchemas')
  private onInitedDatabaseSchemas(callback: Function) {
    if (!this.initedDatabaseSchemasCallbacks.includes(callback)) {
      this.initedDatabaseSchemasCallbacks.push(callback);
    }
    if (this.initedDatabaseSchemas) {
      callback();
    }
  }

  @Provide('offInitedDatabaseSchemas')
  private offInitedDatabaseSchemas(callback: Function) {
    const idx = this.initedDatabaseSchemasCallbacks.indexOf(callback);
    if (idx >= 0) {
      this.initedDatabaseSchemasCallbacks.splice(idx, 1);
    }
  }

  @ProvideReactive('formulaController')
  private formulaController: FormulaController | null = null;

  @ProvideReactive('databaseSchemas')
  private get databaseSchemas(): DatabaseSchema[] {
    return DatabaseSchemaModule.databaseSchemas;
  }

  @Provide('findSchema')
  private findData(dbName: string, tableName: string, columnName: string) {
    const database = this.databaseSchemas.find(db => db.name === dbName);
    let table = null;
    let column = null;
    if (database && tableName) {
      table = database.tables.find(t => t.name === tableName);
    }
    if (table && columnName) {
      column = table.columns.find(c => c.name === columnName);
    }
    return {
      database,
      table,
      column
    };
  }

  async mounted() {
    this.loadingDatabaseSchemas = true;
    await DatabaseSchemaModule.loadAllDatabaseInfos();
    await DatabaseSchemaModule.loadAllDatabaseSchemas();
    this.loadingDatabaseSchemas = false;
    this.initedDatabaseSchemas = true;
    this.initedDatabaseSchemasCallbacks.forEach(callback => callback());
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.data-management-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  ::v-deep {
    @import '~@/themes/scss/di-variables.scss';
    @import '~bootstrap/scss/variables';
    @import '~@/themes/scss/data-builder/custom/_modal.scss';
    @import '~@/themes/scss/data-builder/custom/_navbar.scss';
    @import '~@/themes/scss/data-builder/custom/_dark-dashboard.scss';
    @import '~@/themes/scss/data-builder/custom/dark-sidebar.scss';
    @import '~@/themes/scss/data-builder/custom/_misc.scss';

    .data-management-body {
      flex: 1;
      margin: 32px 32px 15px 32px;

      .data-management-body-content {
        margin-top: 24px;
        height: calc(100vh - 150px);
        display: flex;
      }

      .left-panel {
        background-color: var(--charcoal-2) !important;
        border-radius: 4px;
        margin-right: 16px;
        width: 20%;
        min-width: 260px;
        max-width: 320px;
      }

      .right-panel {
        background-color: var(--charcoal-2);
        width: 80%;
        height: 100%;
        padding: 20px 24px;
        flex: 1;
        font-size: 16px;

        .data-management-tips {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          color: #fff;
          opacity: 0.5;
          font-size: 20px;

          .data-management-tips--icon {
            font-size: 40px;
            margin-bottom: 16px;
            line-height: 1;
          }
          .data-management-tips--title {
            font-size: 14px;
          }
        }
      }

      .table-container,
      .infinite-table {
        overflow: auto;
        box-shadow: 0 2px 8px 0 #0000001a;
        border-radius: 4px;
        max-height: 100%;

        table {
          margin-bottom: 0 !important;
          border-collapse: separate;
          border-spacing: 0;
          td,
          th {
            padding: 10px 12px;
            font-size: 14px !important;
          }

          thead {
            position: sticky;
            top: 0;
            z-index: 1;

            th {
              border-top: none;
              background-color: var(--header-background-color, #4a506a);
            }
          }

          tbody {
            tr {
              &:nth-child(even) td {
                background-color: var(--row-even-background-color, #2f3240);
                color: var(--row-even-color, #ffffffcc);
              }

              &:nth-child(odd) td {
                background-color: var(--row-odd-background-color, #272a36);
                color: var(--row-odd-color, #ffffffcc);
              }
            }
          }
          tr {
            th,
            td {
              border: none;
              border-right: 1px solid #ffffff14;
            }

            th:last-child,
            td:last-child {
              border-right: none;
            }
          }
        }
      }

      .table-chart-container {
        padding: 0;
        background-color: var(--charcoal-2);

        .table-chart-header-content {
          display: none;
        }

        .table-chart-table-content {
          background: var(--charcoal-2);
        }
      }
    }
  }
}
</style>

<style lang="scss">
body,
html,
#app {
  height: 100% !important;
}
</style>
