import { Component, Ref, Provide } from 'vue-property-decorator';

import '@/screens/DataIngestion/components/DiUploadDocument/assets/style.css';
// @ts-ignore
import TableItem from './components/TableItem';
// @ts-ignore
import TableRelationshipService from '@/screens/DataIngestion/components/DiUploadDocument/services/TableRelationshipService';
import LeaderLine from 'leader-line-new';
import difference from 'lodash/difference';
import xor from 'lodash/xor';
import { Log } from '@core/utils';

const DROP_TYPE = 'drop_table';
const $ = window.$;
const DATA_TRANSFER_KEY = {
  Type: 'type',
  DatabaseName: 'database_name',
  TableName: 'table_name'
};

import DataManagementChild from '../DataManagementChild';
import { DatabaseSchema, TableSchema, Column } from '@core/domain';

type LLConnection = LeaderLine & {
  $el: HTMLElement;
  fromTable: TableSchema;
  fromColumn: Column;
  toTable: TableSchema;
  toColumn: Column;
};

@Component({
  components: {
    TableItem
  }
})
export default class DataRelationship extends DataManagementChild {
  private selectedConnection: any = null;
  private onNewConnectionCallbacks: Function[] = [];
  private onRemoveConnectionCallbacks: Function[] = [];
  private errors: any[] = [];
  private loading = false;
  private mapDatabase: Record<string, DatabaseSchema> = {};
  private highlightedTable: TableSchema | null = null;
  private oldConnections: LLConnection[] = [];
  private currentConnections: LLConnection[] = [];
  private addedTables: TableSchema[] = [];
  private loadingTables: TableSchema[] = [];
  private mapRelationship: Record<string, any> = {};
  private isDraging = false;
  // private model = {
  //   tables: [],
  //   connections: [],
  //   oldConnections: [],
  // };

  @Ref('container')
  private container: HTMLElement | undefined;

  get canSave() {
    return !this.loading && xor(this.oldConnections, this.currentConnections).length > 0;
  }

  get error() {
    return this.errors.length > 0;
  }

  @Provide('getContainment')
  private getContainment() {
    return this.$refs.container;
  }

  // findData: this.findData,
  // getTable: this.getTable,
  // getColumn: this.getColumn,

  // newConnection: this.newConnection,
  // getConnection: this.getConnection,
  // removeConnection: this.removeConnection,
  // getColumnElId: this.getColumnElId,
  @Provide('onNewConnection')
  private onNewConnection(callback: Function) {
    this.onNewConnectionCallbacks.push(callback);
  }

  @Provide('offNewConnection')
  private offNewConnection(callback: Function) {
    this.onNewConnectionCallbacks.filter(fn => fn !== callback);
  }

  @Provide('onRemoveConnection')
  private onRemoveConnection(callback: Function) {
    this.onRemoveConnectionCallbacks.push(callback);
  }

  @Provide('offRemoveConnection')
  private offRemoveConnection(callback: Function) {
    this.onRemoveConnectionCallbacks.filter(fn => fn !== callback);
  }
  //
  // private resetData() {
  //   this.addedTables = [];
  //   this.currentConnections = [];
  //   this.oldConnections = [];
  // }

  @Ref('contextMenu')
  private readonly contextMenu?: HTMLElement;

  private showConnectionContextMenu(e: MouseEvent) {
    $(document.body).off('mousedown', this.hideConnectionContextMenu);

    if (this.contextMenu) {
      this.contextMenu.classList.add('show');
      this.contextMenu?.style.setProperty('top', e.clientY + 'px');
      this.contextMenu?.style.setProperty('left', e.clientX + 'px');
    }

    setTimeout(() => {
      $(document.body).one('mousedown', this.hideConnectionContextMenu);
    }, 500);
  }

  private hideConnectionContextMenu(e: MouseEvent | undefined) {
    if (!e || $(this.$refs.contextMenu).has(e.target).length <= 0) {
      this.contextMenu?.classList.remove('show');
      this.selectedConnection = null;
    }
  }

  private removeRelationship() {
    Log.debug('removeRelationship', this.selectedConnection);
    if (this.selectedConnection) {
      this.removeConnection(this.selectedConnection);
      this.hideConnectionContextMenu(undefined);
    }
  }

  private selectConnection(connection: any, e: MouseEvent) {
    Log.debug('Show context menu');
    this.showConnectionContextMenu(e);
    this.selectedConnection = connection;
  }

  private processNewConnection(connection: LLConnection) {
    this.currentConnections.push(connection);
    this.onNewConnectionCallbacks.forEach(fn => fn(connection));
    // console.log('onAddConnection', connection, srcData, destData);
  }

  private onDragStart(e: DragEvent, database: DatabaseSchema, table: TableSchema) {
    Log.debug('onDragStart');
    e.dataTransfer?.setData(DATA_TRANSFER_KEY.Type, DROP_TYPE);
    e.dataTransfer?.setData(DATA_TRANSFER_KEY.DatabaseName, database.name);
    e.dataTransfer?.setData(DATA_TRANSFER_KEY.TableName, table.name);
    const img = document.createElement('img');
    img.src = '/static/icons/upload@3x.png';
    e.dataTransfer?.setDragImage(img, 10, 10);
    this.isDraging = true;
  }

  private onDragOver(e: DragEvent) {
    Log.debug('onDragOver');
    e.preventDefault();
    (e.target as HTMLElement).classList.add('active');
  }

  private onDragLeave(e: DragEvent) {
    Log.debug('onDragLeave');
    (e.target as HTMLElement).classList.remove('active');
  }

  private onDragEnd(e: DragEvent) {
    Log.debug('onDragEnd');
    (e.target as HTMLElement).classList.remove('active');
    this.isDraging = false;
  }

  private highlightTable(table: TableSchema) {
    this.highlightedTable = table;
    setTimeout(() => {
      this.highlightedTable = null;
    }, 2000);
  }

  private showTableRelationships() {
    const results: LLConnection[] = [];
    Object.values(this.mapRelationship).forEach(item => {
      Object.values(item.relationship_map).forEach(relationships => {
        // @ts-ignore
        relationships.forEach(rel => {
          if (!this.findSchema) return;
          const fromSchema = this.findSchema(rel.first.db_name, rel.first.tbl_name, rel.first.field_name);
          const toSchema = this.findSchema(rel.second.db_name, rel.second.tbl_name, rel.second.field_name);

          const fromTable = fromSchema.table;
          const fromColumn = fromSchema.column;
          const toTable = toSchema.table;
          const toColumn = toSchema.column;

          if (fromTable && fromColumn && toTable && toColumn && this.addedTables.includes(fromTable) && this.addedTables.includes(toTable)) {
            Log.debug('Auto add connection', { fromTable, fromColumn, toTable, toColumn });
            const newConnection = this.newConnection(fromTable, fromColumn, toTable, toColumn);
            if (newConnection) {
              results.push(newConnection);
            }
          }
        });
      });
    });
    return results;
  }

  private isLoadingRelationship(table: TableSchema) {
    return this.loadingTables.includes(table);
  }

  private async getTableRelationships(table: TableSchema) {
    this.loadingTables.push(table);
    const resp = await TableRelationshipService.getRelationships(table.dbName, table.name);
    if (!resp.error) {
      this.mapRelationship[this.getTableKey(table)] = resp.data;
    }
    const newConnections = this.showTableRelationships();
    this.oldConnections = this.oldConnections.concat(newConnections);
    this.loadingTables = this.loadingTables.filter(i => i !== table);
    Log.debug(resp);
  }

  private onDrop(e: DragEvent) {
    if (!this.findSchema) return;
    (e.target as HTMLElement).classList.remove('active');
    const type = e.dataTransfer?.getData(DATA_TRANSFER_KEY.Type);
    if (type !== DROP_TYPE) return;
    const databaseName = e.dataTransfer?.getData(DATA_TRANSFER_KEY.DatabaseName);
    const tableName = e.dataTransfer?.getData(DATA_TRANSFER_KEY.TableName);

    Log.debug('onDrop', type, databaseName, tableName);

    const foundData = this.findSchema(databaseName, tableName);
    const targetTable = foundData.table;

    Log.debug('onDrop', targetTable);
    if (foundData.database && foundData.table) {
      const position: Record<string, number> = { left: e.offsetX - 40, top: e.offsetY };
      this.addTable(foundData.database, foundData.table, position);
    } else {
      Log.debug('Not found target table', databaseName, tableName);
    }
  }

  private addTable(database: DatabaseSchema, table: TableSchema, position: Record<string, number>) {
    if (!this.mapDatabase[database?.name as string]) {
      this.mapDatabase[database.name] = database;
    }
    if (table && this.addedTables.indexOf(table) < 0) {
      // @ts-ignore
      table.position = position;
      this.addedTables.push(table);
      return this.getTableRelationships(table);
    } else {
      this.highlightTable(table);
    }
  }

  private renewConnection(connection: LLConnection) {
    // @ts-ignore
    const renewConnection = this.newConnection(connection.fromTable, connection.fromColumn, connection.toTable, connection.toColumn);
    if (renewConnection) {
      const idx = this.oldConnections.indexOf(connection);
      this.oldConnections[idx] = renewConnection;
      this.currentConnections.filter(c => c !== connection);
    }
  }

  @Provide('removeConnection')
  private removeConnection(connection: LLConnection, isEmit = true) {
    Log.debug(connection);
    // @ts-ignore
    if (connection.deleted) return;
    // @ts-ignore
    document.body.appendChild(connection.$el);
    try {
      connection.remove();
      // @ts-ignore
      connection.deleted = true;
    } catch (e) {
      Log.debug(e);
    }
    if (isEmit) {
      this.onRemoveConnectionCallbacks.forEach(fn => fn(connection));
    }
    this.currentConnections = this.currentConnections.filter(i => i !== connection);
  }

  private removeTable(table: TableSchema) {
    this.oldConnections = this.oldConnections.filter(c => c.fromTable !== table && c.toTable !== table);
    const removeConnections = this.currentConnections.filter(c => c.fromTable === table || c.toTable === table);
    removeConnections.forEach(c => this.removeConnection(c));
    this.addedTables = this.addedTables.filter(i => i !== table);
  }

  private calcSocketOption(startEl: HTMLElement, endEl: HTMLElement) {
    const $startEl = $(startEl);
    const $endEl = $(endEl);
    let startSocket = 'left';
    let endSocket = 'left';
    const startLeft = $startEl.offset().left;
    const startWidth = $startEl.width();
    const endLeft = $endEl.offset().left;
    const endWidth = $endEl.width();

    if (startLeft + startWidth < endLeft) {
      startSocket = 'right';
      endSocket = 'left';
    } else if (endLeft + endWidth < startLeft) {
      startSocket = 'left';
      endSocket = 'right';
    }
    return {
      startSocket,
      endSocket
    };
  }

  @Provide('getColumnElId')
  private getColumnElId(table: TableSchema, column: Column): string {
    return ['$rm_col', table.dbName, table.name, column.name].join('.');
  }

  private getColumnEl(table: TableSchema, column: Column): HTMLElement | null {
    return document.getElementById(this.getColumnElId(table, column));
  }

  @Provide('newConnection')
  private newConnection(fromTable: TableSchema, fromColumn: Column, toTable: TableSchema, toColumn: Column): LLConnection | null {
    const srcEl = this.getColumnEl(fromTable, fromColumn);
    const destEl = this.getColumnEl(toTable, toColumn);

    // Not Allow same column
    if (srcEl === destEl || !srcEl || !destEl) return null;

    const foundConnection = this.getConnection(fromTable, fromColumn, toTable, toColumn);
    // not allow exited connection
    if (foundConnection) {
      Log.debug('exited connection', foundConnection);
      return null;
    }

    const socketOption = this.calcSocketOption(srcEl, destEl);
    // @ts-ignore
    const connection: LLConnection = new LeaderLine(srcEl, destEl, {
      size: 1,
      color: '#597fff',

      startPlug: 'disc',
      startPlugSize: 3,
      startPlugColor: 'rgba(0,0,0,0)',
      startPlugOutline: true,
      startPlugOutlineColor: '#597fff',
      startPlugOutlineSize: 1,

      endPlug: 'disc',
      endPlugSize: 3,
      endPlugColor: 'rgba(0,0,0,0)',
      endPlugOutline: true,
      endPlugOutlineColor: '#597fff',
      endPlugOutlineSize: 1,
      path: 'fluid',

      ...socketOption
    });
    const connectionEl = $('.leader-line').last();
    connectionEl.addClass('db-relationship-line');

    // move leader line inside containment
    this.container?.appendChild(connectionEl[0]);
    const connectionPathEl = connectionEl.find('path');
    connectionPathEl.on('click', (e: MouseEvent) => {
      e.preventDefault();
      this.selectConnection(connection, e);
    });
    // connectionPathEl.on('mouseleave', e => {
    //   e.preventDefault();
    //   connection.setOptions({
    //     color: 'rgba(255, 255, 255, 0.5)'
    //   });
    // });
    // connectionPathEl.on('mouseover', e => {
    //   e.preventDefault();
    //   connection.setOptions({
    //     color: 'rgba(255, 255, 255, 1)'
    //   });
    // });
    connection.$el = connectionEl[0];
    connection.fromTable = fromTable;
    connection.fromColumn = fromColumn;
    connection.toTable = toTable;
    connection.toColumn = toColumn;
    this.processNewConnection(connection);
    return connection;
  }

  @Provide('getConnection')
  private getConnection(fromTable: TableSchema, fromColumn: Column, toTable: TableSchema, toColumn: Column) {
    return this.currentConnections.find(connection => {
      return (
        (connection.fromColumn === fromColumn && connection.toColumn === toColumn) || (connection.fromColumn === toColumn && connection.toColumn === fromColumn)
      );
    });
  }

  private getTableKey(table: TableSchema) {
    return [table.dbName, table.name].join('.');
  }

  private showAllRelationship(table: TableSchema) {
    Log.debug('showAllRelationship', table);
  }

  private discardChanges() {
    Log.debug('discardChanges');
    const newConnections = difference(this.currentConnections, this.oldConnections);
    const removeConnections = difference(this.oldConnections, this.currentConnections);

    newConnections.forEach(connection => {
      this.removeConnection(connection);
    });

    removeConnections.forEach(connection => {
      this.renewConnection(connection);
    });

    this.errors = [];
  }

  private async save() {
    this.loading = true;

    function makeRelationshipKey(table1: TableSchema, table2: TableSchema) {
      return [[table1.dbName, table1.name].join('.'), [table2.dbName, table2.name].join('.')].sort().join('::');
    }

    const removeConnections = difference(this.oldConnections, this.currentConnections);
    const oldAndNewConnections = this.oldConnections.concat(this.currentConnections);

    Log.debug(oldAndNewConnections);
    Log.debug('removeConnections', removeConnections);

    const mapConnection: Record<string, any> = {};
    for (const connection of oldAndNewConnections) {
      Log.debug(connection);
      const dbKey = makeRelationshipKey(connection.fromTable, connection.toTable);
      if (!mapConnection[dbKey]) {
        mapConnection[dbKey] = {
          // eslint-disable-next-line @typescript-eslint/camelcase
          left_tbl: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            db_name: connection.fromTable.dbName,
            // eslint-disable-next-line @typescript-eslint/camelcase
            tbl_name: connection.fromTable.name
          },
          // eslint-disable-next-line @typescript-eslint/camelcase
          right_tbl: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            db_name: connection.toTable.dbName,
            // eslint-disable-next-line @typescript-eslint/camelcase
            tbl_name: connection.toTable.name
          },
          relationship: []
        };
      }
      if (!removeConnections.includes(connection)) {
        mapConnection[dbKey].relationship.push({
          first: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            db_name: connection.fromTable.dbName,
            // eslint-disable-next-line @typescript-eslint/camelcase
            tbl_name: connection.fromTable.name,
            // eslint-disable-next-line @typescript-eslint/camelcase
            field_name: connection.fromColumn.name,
            // eslint-disable-next-line @typescript-eslint/camelcase
            field_type: connection.fromColumn.className
          },
          second: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            db_name: connection.toTable.dbName,
            // eslint-disable-next-line @typescript-eslint/camelcase
            tbl_name: connection.toTable.name,
            // eslint-disable-next-line @typescript-eslint/camelcase
            field_name: connection.toColumn.name,
            // eslint-disable-next-line @typescript-eslint/camelcase
            field_type: connection.toColumn.className
          }
        });
      }
    }

    const errors: any[] = [];
    for (const relationship of Object.values(mapConnection)) {
      const resp = await TableRelationshipService.putTableRelationship(relationship);
      if (resp.error) {
        errors.push([relationship, resp.message]);
      }
      Log.debug(resp);
    }

    if (!errors.length) {
      this.oldConnections = this.currentConnections.concat([]);
    }

    this.errors = errors;

    this.loading = false;
  }
}
