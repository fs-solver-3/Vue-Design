/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 11:23 PM
 */

import { Column } from '../../Model';

export class CreateTableRequest {
  dbName!: string;
  tblName!: string;
  columns!: Column[];
  primaryKeys!: string[];
  orderBys!: string[];

  constructor(dbName: string, tblName: string, columns: Column[], primaryKeys: string[], orderBys: string[]) {
    this.dbName = dbName;
    this.tblName = tblName;
    this.columns = columns;
    this.primaryKeys = primaryKeys;
    this.orderBys = orderBys;
  }
}
