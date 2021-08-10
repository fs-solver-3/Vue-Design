import { initHttpClient, config } from './Common';
import { Log } from '@core/utils';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';

const http = initHttpClient({
  baseURL: config.api
});

const TableRelationshipService = Object.freeze({
  getRelationships(databaseName, tableName) {
    return http.post(`/table_relationships`, { db_name: databaseName, tbl_name: tableName });
  },
  putTableRelationship(data) {
    return http.put(`/table_relationships/update`, data);
  }
});

export default TableRelationshipService;
