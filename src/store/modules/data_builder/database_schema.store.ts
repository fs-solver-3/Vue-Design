/*
 * @author: tvc12 - Thien Vi
 * @created: 12/4/20, 6:05 PM
 */

import { DatabaseInfo, DatabaseSchema, Column, ColumnType, Expression, TableSchema } from '@core/domain/Model';
import { SlTreeNodeModel } from '@/shared/components/builder/treemenu/SlVueTree';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared/enums/stores.enum';
import { ListUtils, SchemaUtils } from '@/utils';
import { Inject } from 'typescript-ioc';
import { SchemaService } from '@core/schema/service/SchemaService';
import { CreateColumnRequest } from '@core/schema/domain/CreateColumnRequest';
import { DIException, FormulaException } from '@core/domain/Exception';
import { DetectExpressionTypeRequest } from '@core/schema/domain/DetectExpressionTypeRequest';
import { IdGenerator } from '@/utils/id_generator';
import { StringUtils } from '@/utils/string.utils';
import { CreateCalculatedFieldData, DeletCalculatedFieldData, EditCalculatedFieldData } from '@/screens/ChartBuilder/model/CalculatedFieldData';
import { Log } from '@core/utils';
import { UpdateColumnRequest } from '@core/schema/domain/UpdateColumnRequest';
import { DeleteColumnRequest } from '@core/schema/domain/DeleteColumnRequest';

const getCreateColumnRequest = (calculatedFieldData: CreateCalculatedFieldData, expressionType: ColumnType) => {
  const { tableSchema, expression, displayName } = calculatedFieldData;
  const columnName: string = IdGenerator.generateName(displayName);
  const column: Column | undefined = Column.fromObject({
    name: columnName,
    displayName: displayName,
    defaultExpression: expression,
    description: 'Calculated field',
    isNullable: true,
    className: expressionType
  });
  if (column) {
    return new CreateColumnRequest(tableSchema.dbName, tableSchema.name, column);
  } else {
    throw new DIException('Cannot create calculated field');
  }
};

@Module({ store: store, name: Stores.databaseSchemaStore, dynamic: true, namespaced: true })
class DatabaseSchemaStore extends VuexModule {
  // state
  databaseInfos: DatabaseInfo[] = [];
  databaseSchema: DatabaseSchema | null = null;
  tableSchemas: SlTreeNodeModel<TableSchema>[] = [];
  dbNameSelected = '';
  databaseSchemas: DatabaseSchema[] = [];

  @Inject
  private readonly schemaService!: SchemaService;

  get searchDatabaseSchemas(): (keyword: string) => SlTreeNodeModel<TableSchema>[] {
    return (keyword: string) =>
      this.tableSchemas
        .map(tableSchema => {
          return {
            ...tableSchema,
            isExpanded: true,
            // fixme: enhance code here
            children: tableSchema.children?.filter(child => StringUtils.isIncludes(keyword, child.title)) ?? []
          };
        })
        .filter(tableSchema => ListUtils.isNotEmpty(tableSchema.children));
  }

  @Mutation
  setDatabases(newDatabaseInfos: DatabaseInfo[]): void {
    this.databaseInfos = newDatabaseInfos;
  }

  @Mutation
  setDatabaseSchema(newDatabaseSchema: DatabaseSchema) {
    // update databaseSchemas
    const schemaIdx = this.databaseSchemas.findIndex(db => db.name === newDatabaseSchema.name);
    if (schemaIdx >= 0) {
      this.databaseSchemas[schemaIdx] = newDatabaseSchema;
      this.databaseSchemas = this.databaseSchemas.concat([]);
    } else {
      const databaseIdx = this.databaseInfos.findIndex(db => db.name === newDatabaseSchema.name);
      if (databaseIdx >= 0) {
        this.databaseSchemas.splice(databaseIdx, 0, newDatabaseSchema);
        this.databaseSchemas = this.databaseSchemas.concat([]);
      }
    }

    this.databaseSchema = newDatabaseSchema;
    this.tableSchemas = SchemaUtils.toTableSchemaNodes(newDatabaseSchema);
  }

  @Mutation
  setDbNameSelected(dbName: string) {
    this.dbNameSelected = dbName;
  }

  @Mutation
  reset() {
    this.databaseInfos = [];
    this.databaseSchema = null;
    this.tableSchemas = [];
    this.dbNameSelected = '';
  }

  @Action({ commit: 'setDatabases' })
  async loadAllDatabaseInfos(): Promise<DatabaseInfo[]> {
    const databaseInfos = await this.schemaService.getDatabases();
    return SchemaUtils.sortDatabaseInfos(databaseInfos);
  }

  @Action
  async selectDatabase(dbName: string): Promise<DatabaseSchema> {
    this.setDbNameSelected(dbName);
    const databaseSchema: DatabaseSchema = await this.handleGetDatabaseSchema(dbName);
    this.setDatabaseSchema(databaseSchema);
    this.expandFirstTable();
    return databaseSchema;
  }

  @Action
  async handleGetDatabaseSchema(dbName: string): Promise<DatabaseSchema> {
    const databaseSchema = await this.schemaService.getDatabaseSchema(dbName.replace(/ /g, '+'));
    return SchemaUtils.sort(databaseSchema);
  }

  @Action
  handleSelectDefaultDatabase(): Promise<DatabaseSchema> | Promise<void> {
    if (ListUtils.isNotEmpty(this.databaseInfos)) {
      const dbName = this.databaseInfos[0].name;
      return this.selectDatabase(dbName);
    } else {
      return Promise.resolve();
    }
  }

  @Action
  async loadAllDatabaseSchemas(): Promise<void> {
    const futureAllDatabaseSchemas: Promise<DatabaseSchema>[] = this.databaseInfos.map(dbInfo => this.handleGetDatabaseSchema(dbInfo.name));
    const databaseSchemas = await Promise.all(futureAllDatabaseSchemas);
    this.setDatabaseSchemas(databaseSchemas);
  }

  @Mutation
  setDatabaseSchemas(databaseSchemas: DatabaseSchema[]) {
    this.databaseSchemas = databaseSchemas;
  }

  @Action
  async createCalculatedField(calculatedFieldData: CreateCalculatedFieldData): Promise<void> {
    const expressionType = await this.detectExpressionType(calculatedFieldData);
    const createColumnRequest: CreateColumnRequest = getCreateColumnRequest(calculatedFieldData, expressionType);
    try {
      await this.schemaService.createColumn(createColumnRequest);
    } catch (ex) {
      Log.error('createCalculatedField::ex', ex);
      return Promise.reject(new DIException('Can not create new column'));
    }
  }

  @Action
  async deleteCalculatedField(payload: DeletCalculatedFieldData): Promise<void> {
    const request = new DeleteColumnRequest(payload.dbName, payload.tblName, payload.fieldName);
    await this.schemaService.deleteCalculatedColumn(request);
  }

  @Action
  async editCalculatedField(payload: EditCalculatedFieldData): Promise<void> {
    const { tableSchema, newExpression, displayName, editingColumn } = payload;
    const expressionType = await this.detectExpressionType({ tableSchema: tableSchema, expression: newExpression });
    const newColumn: Column = Object.assign({}, editingColumn, {
      displayName: displayName,
      defaultExpression: newExpression,
      className: expressionType
    });
    const request = new UpdateColumnRequest(tableSchema.dbName, tableSchema.name, newColumn);
    try {
      await this.schemaService.updateColumn(request);
    } catch (ex) {
      Log.error('editCalculatedField::exception', ex);
      return Promise.reject(new DIException(`Can not edit column ${payload.editingColumn.displayName}`));
    }
  }

  @Action
  async detectExpressionType(payload: { tableSchema: TableSchema; expression: Expression }): Promise<ColumnType> {
    try {
      const { tableSchema, expression } = payload;
      const detectExpressionTypeRequest = new DetectExpressionTypeRequest(tableSchema.dbName, tableSchema.name, expression.expr);
      const expressionType = await this.schemaService.detectExpressionType(detectExpressionTypeRequest);
      return expressionType;
    } catch (ex) {
      Log.error('detectExpressionType::exception', ex);
      return Promise.reject(new FormulaException('Formula invalid'));
    }
  }

  @Action
  async reload(dbName: string): Promise<void> {
    await this.selectDatabase(dbName);
  }

  @Mutation
  collapseAllTable(): void {
    this.tableSchemas.forEach(table => {
      table.isExpanded = false;
    });
  }

  @Mutation
  expandFirstTable(): void {
    const table = ListUtils.getHead(this.tableSchemas);
    if (table) {
      table.isExpanded = true;
    }
  }

  @Mutation
  expandTables(tableNames: string[]): void {
    const tableNamesAsSet = new Set(tableNames);
    this.tableSchemas
      .filter(schema => {
        const tableName = (schema.tag as TableSchema).name;
        return tableNamesAsSet.has(tableName);
      })
      .forEach(schema => (schema.isExpanded = true));
  }

  @Action
  dropTable(payload: { dbName: string; tblName: string }): Promise<boolean> {
    const { dbName, tblName } = payload;
    return this.schemaService.dropTable(dbName, tblName);
  }
}

export const DatabaseSchemaModule = getModule(DatabaseSchemaStore);
