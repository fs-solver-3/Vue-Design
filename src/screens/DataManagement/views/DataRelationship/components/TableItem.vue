<template>
  <div class="table-item-container" :class="{ highlight: highlight }">
    <!--    <style>-->
    <!--      :root {-->
    <!--        &#45;&#45;ll-translate-x: {{ leaderLineTransform.x }};-->
    <!--        &#45;&#45;ll-translate-y: {{ leaderLineTransform.y }};-->
    <!--      }-->
    <!--    </style>-->
    <div class="database-name">
      <slot name="database-name"></slot>
    </div>
    <div class="table-item">
      <div class="table-name">
        <span v-if="table.displayName"> {{ table.displayName }} </span>
        <em v-else>{{ table.name }}</em>

        <div class="dropdown table-actions ml-2">
          <span v-if="loading" class="fa fa-spin fa-spinner"></span>
          <a v-else href="#" class="dropdown-toggle" data-toggle="dropdown"></a>
          <div class="dropdown-menu dropdown-menu-right">
            <!--            <button :disabled="loading" @click.prevent="$emit('showAllRelationship', table)" class="dropdown-item">Show All Relationship</button>-->
            <button :disabled="loading" @click.prevent="$emit('remove', table)" class="dropdown-item">Hide table</button>
          </div>
        </div>
      </div>
      <div class="table-columns">
        <a
          @dragstart="e => onDragStart(e, column)"
          @dragover="e => onDragOver(e, column)"
          @dragleave="e => onDragLeave(e, column)"
          @drop="e => onDrop(e, column)"
          :id="getColumnElId(table, column)"
          draggable="true"
          v-for="column in table.columns"
          :key="column.name"
          @click.prevent
          href="#"
          class="table-columns-item"
        >
          <img :src="require(`@/assets/icon/${getIcon(column)}`)" class="table-columns-icon" />
          {{ column.displayName || column.name }}
        </a>
      </div>
    </div>
  </div>
</template>
<style lang="scss" src="./TableItem.style.scss"></style>
<script>
import Draggabilly from 'draggabilly';
import { IconUtils } from '@/utils';
import { Log } from '@core/utils';
const DROP_TYPE = 'drop_column';
const DATA_TRANSFER_KEY = {
  Type: 'type',
  DatabaseName: 'database_name',
  TableName: 'table_name',
  ColumnName: 'column_name',
  ColumnElementId: 'column_element_id'
};
const $ = window.$;

export default {
  name: 'TableItem',
  props: {
    table: Object,
    highlight: Boolean,
    loading: Boolean
  },
  inject: [
    'getContainment',
    'onNewConnection',
    'offNewConnection',
    'onRemoveConnection',
    'offRemoveConnection',
    'newConnection',
    'getConnection',
    'removeConnection',
    'getColumnElId',
    'findSchema'
  ],
  data() {
    this.connections = [];
    this.otherConnections = [];
    return {
      leaderLineTransform: {
        x: 0,
        y: 0
      }
    };
  },
  mounted() {
    this.onNewConnection(this.processNewConnection);
    this.onRemoveConnection(this.processRemoveConnection);
    // console.log(LeaderLine);
    this.$nextTick(() => {
      const containment = this.getContainment();
      // console.log(this.getContainment());
      this.draggie = new Draggabilly(this.$el, {
        containment,
        handle: '.table-name, .database-name'
      });
      const parentPos = $(containment).offset();
      const childPos = $(this.$el).offset();
      this.draggie.on('dragMove', this.processMoveTable);
      this.initTransformStyle(containment);
      if (this.table.position) {
        $(this.$el).css({
          position: 'absolute',
          top: this.table.position.top,
          left: this.table.position.left
        });
      } else {
        setTimeout(() => {
          $(this.$el).css({
            position: 'absolute',
            top: childPos.top - parentPos.top,
            left: childPos.left - parentPos.left
          });
        }, 0);
      }
    });
  },
  destroyed() {
    this.offNewConnection(this.processNewConnection);
    this.offRemoveConnection(this.processRemoveConnection);
    this.draggie.destroy();
    this.connections.forEach(c => this.removeConnection(c));
    this.connections = [];
  },
  methods: {
    initTransformStyle(containment) {
      const rect = containment.getBoundingClientRect();
      containment.setAttribute('style', `--ll-translate-x: ${-rect.x}px; --ll-translate-y: ${-rect.y}px`);
    },
    processNewConnection(newConnection) {
      if (newConnection.fromTable.name === this.table.name || newConnection.toTable.name === this.table.name) {
        this.connections.push(newConnection);
      }
    },
    processRemoveConnection(connection) {
      Log.debug('processRemoveConnection', this.table.name, connection, this.connections.length);
      this.connections = this.connections.filter(item => item !== connection);
      Log.debug(this.table.name, this.connections.length);
    },
    calcSocketOption(startEl, endEl) {
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
    },
    processMoveTable() {
      this.connections.forEach(connection => {
        const socketOption = this.calcSocketOption(connection.start, connection.end);
        connection.setOptions(socketOption);
        connection.position();
      });
    },
    // getTableId(table) {
    //   return this.table.name.replace(/\s/g, '_');
    // },
    onDragStart(e, column) {
      const target = $(e.target).closest('.table-columns-item')[0];
      e.dataTransfer.setData(DATA_TRANSFER_KEY.Type, DROP_TYPE);
      e.dataTransfer.setData(DATA_TRANSFER_KEY.DatabaseName, this.table.dbName);
      e.dataTransfer.setData(DATA_TRANSFER_KEY.TableName, this.table.name);
      e.dataTransfer.setData(DATA_TRANSFER_KEY.ColumnName, column.name);
      e.dataTransfer.setData(DATA_TRANSFER_KEY.ColumnElementId, target.id);
      const img = document.createElement('img');
      img.src = '/static/icons/upload@3x.png';
      e.dataTransfer.setDragImage(img, 10, 10);
    },
    onDragOver(e) {
      e.preventDefault();
      e.target.classList.add('active');
    },
    onDragLeave(e) {
      e.target.classList.remove('active');
    },
    makeConnectionId(srcId, destId) {
      return ['rel', srcId, destId].join('_');
    },
    selectConnection(connection, e) {
      Log.debug(connection);
      this.$emit('selectConnection', connection, e);
    },
    onDrop(e, column) {
      const target = $(e.target).closest('.table-columns-item')[0];
      const type = e.dataTransfer.getData(DATA_TRANSFER_KEY.Type);
      if (type !== DROP_TYPE) return;

      const srcDatabaseName = e.dataTransfer.getData(DATA_TRANSFER_KEY.DatabaseName);
      const srcTableName = e.dataTransfer.getData(DATA_TRANSFER_KEY.TableName);
      const srcColumnName = e.dataTransfer.getData(DATA_TRANSFER_KEY.ColumnName);

      const foundData = this.findSchema(srcDatabaseName, srcTableName, srcColumnName);

      const srcTable = foundData.table; //this.getTable(srcDatabaseName, srcTableName);
      const srcColumn = foundData.column; //this.getColumn(srcDatabaseName, srcTableName, srcColumnName);

      this.newConnection(srcTable, srcColumn, this.table, column);
      target.classList.remove('active');
      //
      // const srcId = e.dataTransfer.getData(DATA_TRANSFER_KEY.ColumnElementId);
      // const srcEl = document.getElementById(srcId);
      // const destEl = $(e.target).closest('.table-columns-item')[0];
      // // Not Allow same column
      // if (srcEl === destEl) return;
      //
      // const srcDatabaseName = e.dataTransfer.getData(DATA_TRANSFER_KEY.DatabaseName);
      // const srcTableName = e.dataTransfer.getData(DATA_TRANSFER_KEY.TableName);
      // const srcColumnName = e.dataTransfer.getData(DATA_TRANSFER_KEY.ColumnName);
      //
      // const srcTable = this.getTable(srcDatabaseName, srcTableName);
      // const srcColumn = this.getColumn(srcDatabaseName, srcTableName, srcColumnName);
      //
      // const foundConnection = this.getConnection(srcTable, srcColumn, this.table, column);
      // // not allow exited connection
      // if (foundConnection) {
      //   Log.debug('foundConnection', foundConnection);
      //   return;
      // }
      //
      // const socketOption = this.calcSocketOption(srcEl, destEl);
      // const connection = new LeaderLine(srcEl, destEl, {
      //   size: 3,
      //   color: 'rgba(255, 255, 255, 0.5)',
      //   startPlug: 'behind',
      //   endPlug: 'behind',
      //   dropShadow: true,
      //   ...socketOption
      // });
      // const connectionEl = $('.leader-line').last();
      // connectionEl.addClass('db-relationship-line');
      //
      // // move leader line inside containment
      // this.getContainment().appendChild(connectionEl[0]);
      // const connectionPathEl = connectionEl.find('path');
      //
      // connectionPathEl.on('click', e => {
      //   e.preventDefault();
      //   this.selectConnection(connection, e);
      // });
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
      // const sourceData = {
      //   tableName: srcTableName,
      //   columnName: srcColumnName
      // };
      // const destData = {
      //   tableName: this.table.name,
      //   columnName: column.name
      // };
      //
      // connection.$el = connectionEl[0];
      // connection.fromTable = srcTable;
      // connection.fromColumn = srcColumn;
      // connection.toTable = this.table;
      // connection.toColumn = column;
      // this.$emit('newConnection', connection, sourceData, destData);
      // this.connections.push(connection);
      // destEl.classList.remove('active');
    },
    getIcon(column) {
      return IconUtils.getIcon({ className: column.class_name, isMaterialized: () => false });
    }
  }
};
</script>
