import { Component, Watch } from 'vue-property-decorator';
import DatabaseTreeView from '@/screens/DataManagement/components/DatabaseTreeView/DatabaseTreeView.vue';
import ChartContainer from '@/screens/DashboardDetail/components/WidgetContainer/charts/ChartContainer.vue';
import { ChartInfo, DatabaseSchema, TableSchema } from '@core/domain';
import { Log } from '@core/utils';
import { DataManagementModule } from '@/screens/DataManagement/store/data_management.store';
import DataManagementChild from '../DataManagementChild';

type DataSchemaModel = {
  database: DatabaseSchema;
  table: TableSchema;
};

@Component({
  components: {
    DatabaseTreeView,
    ChartContainer
  }
})
export default class DataSchema extends DataManagementChild {
  private error = '';
  private model: DataSchemaModel | null = null;
  private tableData: ChartInfo | null = null;
  private loadingTableData = false;

  mounted() {
    if (this.onInitedDatabaseSchemas) {
      this.onInitedDatabaseSchemas(this.selectTableFromRouteQuery);
    }
  }

  destroy() {
    if (this.offInitedDatabaseSchemas) {
      this.offInitedDatabaseSchemas(this.selectTableFromRouteQuery);
    }
  }

  private selectTableFromRouteQuery() {
    if (this.findSchema) {
      const database = this.$route.query?.database || '';
      const table = this.$route.query?.table || '';
      const foundSchema = this.findSchema(database.toString(), table.toString());
      if (foundSchema.database && foundSchema.table) {
        return this.selectTable(foundSchema.database, foundSchema.table);
      } else if (database && table) {
        this.error = `TABLE ${database}.${table} NOT FOUND!`;
      }
    }
  }

  private async selectTable(database: DatabaseSchema, table: TableSchema) {
    if (!database || !table) {
      this.model = null;
      this.tableData = null;
      return;
    }
    if (this.model?.database === database && this.model?.table === table) {
      Log.debug('Already selected');
      return;
    }
    // Update selected Table
    this.model = { database, table };
    this.error = '';

    // Update Route Query
    if (this.$route.query?.database !== database.name || this.$route.query?.table !== table.name) {
      await this.$router.replace({ query: { database: database.name, table: table.name } });
    }

    // Query Table Data
    await this.queryTableData(table);
  }

  private async queryTableData(table: TableSchema) {
    this.tableData = null;
    this.loadingTableData = true;
    const query = `select *
                   from ${[table.dbName, table.name].join('.')}`;
    await DataManagementModule.handleQueryTableData(query);
    this.tableData = DataManagementModule.tableChartInfo;
    this.loadingTableData = false;
  }

  @Watch('$route.query')
  private watchRouteQuery() {
    Log.debug('Route query change', this.$route.query);
  }
}
