import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared';
import { Inject } from 'typescript-ioc';
import { HeaderData } from '@/shared/models';
import { Log } from '@core/utils';
import { DataSourceInfo } from '@core/DataIngestion/Domain/DataSource/DataSourceInfo';
import { DIException, SourceId } from '@core/domain';
import { DataSourceService } from '@core/services/DataSourceService';
import { ListingResponse } from '@core/DataIngestion';

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.dataSourceStore })
class DataSourceStore extends VuexModule {
  dataSources: DataSourceInfo[] = [];
  totalRecord = 0;
  databaseNames: string[] = [];
  tableNames: string[] = [];
  incrementalColumns: string[] = [];

  @Inject
  private dataSourceService!: DataSourceService;

  get dataSourceHeaders(): HeaderData[] {
    return [
      {
        key: 'displayName',
        label: 'Name',
        disableSort: true
      },
      {
        key: 'sourceType',
        label: 'Type',
        disableSort: true
      },
      {
        key: 'action',
        label: 'Action',
        disableSort: true
      }
    ];
  }

  @Action
  loadDataSources(payload: { from: number; size: number }): Promise<DataSourceInfo[]> {
    return this.dataSourceService
      .list(payload.from, payload.size)
      .then(response => {
        this.setDataSources(response);
        return response.data;
      })
      .catch(ex => {
        const exception = DIException.fromObject(ex);
        Log.error('DataIngestion::loadDataSources::exception::', exception.message);
        throw new DIException(ex.message);
      });
  }

  @Mutation
  setDataSources(response: ListingResponse<DataSourceInfo>) {
    this.dataSources = response.data;
    this.totalRecord = response.total;
  }

  @Action
  testDataSourceConnection(request: DataSourceInfo): Promise<boolean> {
    return this.dataSourceService.testConnection(request);
  }

  @Action
  createDataSource(request: DataSourceInfo): Promise<DataSourceInfo> {
    return this.dataSourceService.create(request);
  }

  @Action
  editDataSource(dataSource: DataSourceInfo) {
    return this.dataSourceService.update(dataSource.id, dataSource);
  }

  @Action
  deleteDataSource(id: SourceId) {
    return this.dataSourceService.delete(id);
  }

  @Action
  loadDatabaseName(id: SourceId): Promise<string[]> {
    return this.dataSourceService
      .listDatabaseName(id)
      .then(response => {
        this.setDatabaseNames(response);
        return response;
      })
      .catch(ex => {
        Log.error('DataSourceStore::listDatabaseName::exception::', ex.message);
        this.setDatabaseNames([]);
        return [];
      });
  }

  @Mutation
  setDatabaseNames(databaseNames: string[]) {
    this.databaseNames = databaseNames;
  }

  @Action
  loadTableNames(payload: { id: SourceId; dbName: string }): Promise<string[]> {
    return this.dataSourceService
      .listTableName(payload.id, payload.dbName)
      .then(response => {
        this.setTableNames(response);
        return response;
      })
      .catch(ex => {
        Log.error('DataSourceStore::listTableName::exception::', ex.message);
        this.setTableNames([]);
        return [];
      });
  }
  @Mutation
  setTableNames(tableNames: string[]) {
    this.tableNames = tableNames;
  }

  @Action
  loadIncrementalColumns(payload: { id: SourceId; dbName: string; tblName: string }): Promise<string[]> {
    return this.dataSourceService
      .listIncrementColumns(payload.id, payload.dbName, payload.tblName)
      .then(response => {
        this.setIncrementalColumns(response);
        return response;
      })
      .catch(ex => {
        Log.error('DataSourceStore::listIncrementalColumn::exception::', ex.message);
        this.setIncrementalColumns([]);
        return [];
      });
  }

  @Mutation
  setIncrementalColumns(incrementalNames: string[]) {
    this.incrementalColumns = incrementalNames;
  }
}

export const DataSourceModule = getModule(DataSourceStore);
