import { Component, Vue, InjectReactive, Inject } from 'vue-property-decorator';
import DatabaseTreeView from '@/screens/DataManagement/components/DatabaseTreeView/DatabaseTreeView.vue';
import ChartContainer from '@/screens/DashboardDetail/components/WidgetContainer/charts/ChartContainer.vue';
import { Column, DatabaseSchema, TableSchema } from '@core/domain';

type FindSchemaResponse = {
  database?: DatabaseSchema;
  table?: TableSchema;
  column?: Column;
};

@Component({
  components: {
    DatabaseTreeView,
    ChartContainer
  }
})
export default class DataSchema extends Vue {
  @InjectReactive('databaseSchemas')
  protected readonly databaseSchemas?: DatabaseSchema[];

  @InjectReactive('loadingDatabaseSchemas')
  protected readonly loadingDatabaseSchemas?: boolean;

  @Inject('onInitedDatabaseSchemas')
  protected readonly onInitedDatabaseSchemas?: Function;

  @Inject('offInitedDatabaseSchemas')
  protected readonly offInitedDatabaseSchemas?: Function;

  @Inject('findSchema')
  protected findSchema?: (databaseName?: string, tableName?: string, columnName?: string) => FindSchemaResponse;
}
