import { Action, getModule, Module, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared';
import {
  ChartInfo,
  DatabaseCreateRequest,
  DatabaseInfo,
  QuerySetting,
  RawQuerySetting,
  TableCreationFromQueryRequest,
  TableQueryChartSetting,
  TableSchema,
  TableVizSetting,
  WidgetCommonData
} from '@core/domain';
import { Log } from '@core/utils';
import { Inject } from 'typescript-ioc';
import { SchemaService } from '@core/schema/service/SchemaService';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import { IdGenerator } from '@/utils/id_generator';
import { DashboardControllerModule, QuerySettingModule } from '@/screens/DashboardDetail/stores';

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.dataManagementStore })
export class DataManagementStore extends VuexModule {
  private static DEFAULT_TABLE_ID = -2;

  @Inject
  private readonly schemaService!: SchemaService;

  get tableChartInfo(): ChartInfo {
    const querySetting: QuerySetting = new TableQueryChartSetting([], [], [], new TableVizSetting(), []);
    const commonSetting: WidgetCommonData = { id: DataManagementStore.DEFAULT_TABLE_ID, name: '', description: '' };
    return new ChartInfo(commonSetting, querySetting);
  }

  get databaseInfos(): DatabaseInfo[] {
    return DatabaseSchemaModule.databaseInfos || [];
  }

  @Action
  async handleQueryTableData(query: string): Promise<void> {
    try {
      QuerySettingModule.setQuerySetting({ id: DataManagementStore.DEFAULT_TABLE_ID, query: new RawQuerySetting(query) });
      await DashboardControllerModule.renderChart({ id: DataManagementStore.DEFAULT_TABLE_ID, forceFetch: true });
    } catch (e) {
      Log.error('DataManagementStore::handleQueryTableData::error::', e.message);
    }
  }

  @Action
  createTableFromQuery(payload: { dbName: string; tblDisplayName: string; query: string }): Promise<TableSchema> {
    const { dbName, tblDisplayName, query } = payload;
    const tblName = IdGenerator.generateName(tblDisplayName);
    const request: TableCreationFromQueryRequest = new TableCreationFromQueryRequest(dbName, tblDisplayName, tblName, query);
    return this.schemaService.createTableFromQuery(request);
  }

  @Action
  selectDatabase(dbName: string) {
    DatabaseSchemaModule.selectDatabase(dbName);
  }

  @Action
  createDatabase(displayName: string): Promise<DatabaseInfo> {
    const dbName = IdGenerator.generateName(displayName);
    const request: DatabaseCreateRequest = new DatabaseCreateRequest(dbName, displayName);
    return this.schemaService.createDatabase(request);
  }

  @Action
  searchAndSelectDatabase(dbName: string) {
    DatabaseSchemaModule.loadAllDatabaseInfos().then(() => {
      DatabaseSchemaModule.selectDatabase(dbName);
    });
  }
}

export const DataManagementModule = getModule(DataManagementStore);
