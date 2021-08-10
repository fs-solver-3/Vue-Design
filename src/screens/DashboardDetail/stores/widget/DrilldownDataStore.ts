/*
 * @author: tvc12 - Thien Vi
 * @created: 3/30/21, 1:40 PM
 */

import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { GroupedField, Stores } from '@/shared';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { AbstractTableResponse } from '@core/domain/Response/Query/AbstractTableResponse';
import {
  DatabaseSchema,
  Equal,
  Field,
  FieldRelatedCondition,
  FieldRelatedFunction,
  SeriesQuerySetting,
  TableQueryChartSetting,
  TableSchema,
  WidgetId
} from '@core/domain/Model';
import { QueryService } from '@core/services';
import { Inject } from 'typescript-ioc';
import { CompareRequest, FilterRequest, QueryRequest } from '@core/domain/Request';
import { DIException } from '@core/domain/Exception';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';
import { SchemaUtils } from '@/utils';
import { GroupFieldBuilder } from '@core/schema/service/GroupFieldBuilder';
import { DateFieldFilter, TextFieldFilter } from '@core/schema/service/FieldFilter';
import { Drilldownable } from '@core/domain/Model/Query/Features/Drilldownable';
import { ConditionUtils } from '@core/utils';

@Module({ store: store, name: Stores.drilldownStore, dynamic: true })
class DrilldownDataStore extends VuexModule {
  // path current drilldown
  private idAndDrilldownPaths: Map<WidgetId, string[]> = new Map<WidgetId, string[]>();

  // map id and stack query setting, query setting related with path.
  // index of path same index of setting
  private idAndQuerySettings: Map<WidgetId, QuerySetting[]> = new Map<WidgetId, QuerySetting[]>();

  private databaseAsMap: Map<string, DatabaseSchema> = new Map<string, DatabaseSchema>();

  @Inject
  private queryService!: QueryService;

  get drilldownPaths(): (id: WidgetId) => string[] {
    return (id: WidgetId) => {
      return this.idAndDrilldownPaths.get(id) ?? [];
    };
  }

  get getQuerySetting(): (id: WidgetId, index: number) => QuerySetting | undefined {
    return (id: WidgetId, index: number) => {
      const queries = this.idAndQuerySettings.get(id) ?? [];
      return queries[index] ?? void 0;
    };
  }

  get hasDrilldown(): (id: WidgetId) => boolean {
    return id => {
      const queries = this.idAndQuerySettings.get(id) ?? [];
      return queries.length > 0;
    };
  }

  get getQuerySettings(): (id: WidgetId) => QuerySetting[] {
    return id => {
      return this.idAndQuerySettings.get(id) ?? [];
    };
  }

  @Mutation
  reset() {
    this.idAndDrilldownPaths = new Map<WidgetId, string[]>();
    this.idAndQuerySettings = new Map<WidgetId, QuerySetting[]>();
    this.databaseAsMap = new Map<string, DatabaseSchema>();
  }

  @Action
  loadDrilldownValues(payload: {
    query: QuerySetting;
    filterRequests?: FilterRequest[];
    compareRequest?: CompareRequest;
    from?: number;
    size?: number;
  }): Promise<AbstractTableResponse> {
    if (Drilldownable.isDrilldownable(payload.query)) {
      const { query, filterRequests, compareRequest, from, size } = payload;
      const tableSetting: TableQueryChartSetting = new TableQueryChartSetting([query.getColumnWillDrilldown()], query.filters, query.sorts, {}, []);
      const queryRequest: QueryRequest = new QueryRequest(tableSetting, filterRequests, compareRequest, from ?? -1, size ?? -1);
      return this.queryService.query(queryRequest).then(data => data as AbstractTableResponse);
    } else {
      return Promise.reject(new DIException(`Unsupported ${payload.query.className}`));
    }
  }

  @Action
  async loadGroupedFieldsWillDrilldown(query: QuerySetting): Promise<GroupedField[]> {
    if (Drilldownable.isDrilldownable(query)) {
      const fieldDetailInfos: FieldDetailInfo[] = await this.loadFieldDetails(query.getColumnWillDrilldown().function.field);
      const drilledFields: Field[] = await this.getDrilledFields(query);
      const fieldsWillDrilldown: FieldDetailInfo[] = await this.removeDrilledFields({
        drilledFields: drilledFields,
        allFields: fieldDetailInfos
      });
      return new GroupFieldBuilder(fieldsWillDrilldown)
        .addFilter(new TextFieldFilter())
        .addFilter(new DateFieldFilter())
        .build();
    } else {
      return Promise.reject(new DIException(`Unsupported ${query.className}`));
    }
  }

  @Action
  async loadFieldDetails(field: Field): Promise<FieldDetailInfo[]> {
    const dbSchema: DatabaseSchema = await this.getDatabaseSchema(field.dbName);
    const table: TableSchema | undefined = dbSchema.tables.find(table => table.name === field.tblName);
    if (table) {
      return SchemaUtils.buildFieldsFromTableSchemas([table]);
    } else {
      return [];
    }
  }

  @Action
  async getDatabaseSchema(dbName: string): Promise<DatabaseSchema> {
    if (this.databaseAsMap.has(dbName)) {
      return this.databaseAsMap.get(dbName)!;
    } else {
      const dbSchema: DatabaseSchema = await DatabaseSchemaModule.handleGetDatabaseSchema(dbName);
      this.databaseAsMap.set(dbName, dbSchema);
      return dbSchema;
    }
  }

  @Action
  async drilldown(payload: { toField: FieldRelatedFunction; id: WidgetId; value: string }): Promise<void> {
    const { toField, id, value } = payload;
  }

  @Mutation
  updatePaths(payload: { paths: string[]; id: number }) {
    this.idAndDrilldownPaths.set(payload.id, payload.paths);
  }

  @Mutation
  sliceQueries(payload: { id: number; from: number; to: number }) {
    const { id, from, to } = payload;
    const queries: QuerySetting[] = this.idAndQuerySettings.get(id) ?? [];
    const newQueries: QuerySetting[] = queries.slice(from, to);
    this.idAndQuerySettings.set(id, newQueries);
  }

  @Action
  saveDrilldownData(payload: { query: QuerySetting; id: number; newPath: string }) {
    this.addPath(payload);
    this.addQuery(payload);
  }

  @Mutation
  addQuery(payload: { query: QuerySetting; id: number }) {
    const { id, query } = payload;
    const querySettings: QuerySetting[] = this.idAndQuerySettings.get(id) ?? [];
    querySettings.push(query);
    this.idAndQuerySettings.set(id, querySettings);
  }

  @Mutation
  addPath(payload: { id: number; newPath: string }) {
    const { id, newPath } = payload;
    const paths: string[] = this.idAndDrilldownPaths.get(id) ?? [];
    paths.push(newPath);
    this.idAndDrilldownPaths.set(id, paths);
  }

  @Action
  resetDrilldown(widgetId: WidgetId) {
    this.idAndDrilldownPaths.set(widgetId, []);
    this.idAndQuerySettings.set(widgetId, []);
  }

  @Action
  private async getDrilledFields(query: QuerySetting & Drilldownable): Promise<Field[]> {
    const drilledFields: Field[] = ConditionUtils.getAllFieldRelatedConditions(query.filters)
      .filter(filter => filter instanceof Equal)
      .map(filter => Field.fromObject(filter.field));
    drilledFields.push(Field.fromObject(query.getColumnWillDrilldown().function.field));
    return drilledFields;
  }

  @Action
  private async removeDrilledFields(payload: { allFields: FieldDetailInfo[]; drilledFields: Field[] }): Promise<FieldDetailInfo[]> {
    const { drilledFields, allFields } = payload;

    const fieldsNotDrilled: FieldDetailInfo[] = allFields.filter((fieldDetailInfo: FieldDetailInfo) => {
      return !drilledFields.some(fieldDrilled => fieldDrilled.equals(fieldDetailInfo.field));
    });

    return fieldsNotDrilled;
  }
}

export const DrilldownDataStoreModule = getModule(DrilldownDataStore);
