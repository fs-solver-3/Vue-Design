/*
 * @author: tvc12 - Thien Vi
 * @created: 5/7/21, 2:17 PM
 */

import { Column, Expression, TableSchema } from '@core/domain/Model';

export interface CreateCalculatedFieldData {
  displayName: string;
  tableSchema: TableSchema;
  expression: Expression;
}

export interface EditCalculatedFieldData {
  displayName: string;
  newExpression: Expression;
  tableSchema: TableSchema;
  editingColumn: Column;
}

export interface DeletCalculatedFieldData {
  dbName: string;
  tblName: string;
  fieldName: string;
}

export enum CalculatedFieldModalMode {
  Create = 'create',
  Edit = 'edit'
}
