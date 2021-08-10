<template>
  <div class="user-profile-body-container">
    <a-table
      v-if="isHaveResponse"
      :columns="internalFields"
      :customRow="customRow"
      :data-source="internalRecords"
      :locale="locale"
      :pagination="false"
      :scroll="{ y: maxTableHeight, x: maxTableWidth }"
      responsive
      rowKey="0"
    >
    </a-table>
  </div>
</template>
<script lang="ts">
import { Component, Emit, Prop, Ref, Vue } from 'vue-property-decorator';
import { DiTableHeader, Pagination } from '@/shared/models';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';
import compileStreaming = WebAssembly.compileStreaming;
import { Log } from '@core/utils';

export enum RecordTextAlign {
  left = 'left',
  right = 'right',
  center = 'center'
}

@Component
export default class UserListingBody extends Vue {
  locale = {
    emptyText: 'There are no records to show'
  };

  static readonly INDEX_COLUMN_ID = 'stt';
  static readonly INDEX_COLUMN_WIDTH = 67;
  static readonly INDEX_COLUMN_TITLE = '';
  static readonly CELL_DEFAULT_VALUE = '--';
  static readonly ELLIPSIS = true;

  @Prop({ required: true, type: Array })
  private records!: any[];

  @Prop({ required: true, type: Array })
  private fields!: DiTableHeader[];

  @Prop({ required: true, type: Number })
  private maxTableHeight!: number;

  @Prop({ required: true, type: Boolean })
  private isHaveResponse!: boolean;

  @Prop({ required: true, type: Number })
  from!: number;

  @Prop({ required: false, type: Boolean, default: true })
  hasIndexColumn!: boolean;

  @Ref()
  private tblDirectoryListing!: any;

  private get maxTableWidth() {
    return 250 * this.internalFields.length;
  }

  private get internalFields() {
    const result: any[] = [];

    if (this.hasIndexColumn) {
      const indexColumn = this.buildIndexColumn();
      result.push(indexColumn);
    }
    const columns = this.removeHiddenColumns(this.fields);
    const header = this.buildHeader(columns);
    return result.concat(header);
  }

  private buildIndexColumn(): any {
    //index column
    return {
      title: UserListingBody.INDEX_COLUMN_TITLE,
      dataIndex: UserListingBody.INDEX_COLUMN_ID,
      align: RecordTextAlign.center,
      customRender: (text: any, obj: any, index: number) => {
        return {
          children: this.from + index + 1,
          attrs: {},
          style: {
            background: 'var(--secondary)'
          }
        };
      },
      width: UserListingBody.INDEX_COLUMN_WIDTH,
      fixed: RecordTextAlign.left,
      scopedSlots: { customRender: UserListingBody.INDEX_COLUMN_ID }
    };
  }

  private buildHeader(columns: any[]): any[] {
    return columns.map(column => {
      return {
        title: column.label,
        dataIndex: column.key,
        ellipsis: UserListingBody.ELLIPSIS,
        align: column.isTextLeft ? RecordTextAlign.left : RecordTextAlign.right,
        customRender: (text: any) => {
          return {
            children: text ? text : UserListingBody.CELL_DEFAULT_VALUE,
            attrs: {}
          };
        }
      };
    });
  }
  private removeHiddenColumns(columns: any[]) {
    const dataManager = DI.get(DataManager);
    const configColumns = dataManager.getUserProfileConfigColumns();
    const hiddenColumns = configColumns.filter(column => column.isHidden).map(column => column.displayName);

    return columns.filter(column => !hiddenColumns.includes(column.label));
  }

  private get internalRecords(): any[] {
    if (this.internalFields.length > 0) {
      Log.debug('records::', this.records);
      return this.records;
    } else {
      return [];
    }
  }

  private customRow(record: any) {
    return {
      on: {
        click: () => this.handleOnClickRow(record)
      }
    };
  }

  @Emit('onClickRow')
  private handleOnClickRow(record: any) {
    return record;
  }
}
</script>
<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

::v-deep {
  @import '~@/themes/scss/ant/table';

  .ant-table-tbody > tr > td:first-child {
    border-right: 1px solid rgba(#ffffff, 0.1);
  }

  .ant-table-thead > tr > th:first-child {
    border-right: 1px solid rgba(#ffffff, 0.1);
  }

  .ant-table-thead > tr > th:not(:nth-last-child(1)) {
    border-right: 1px solid rgba(#ffffff, 0.1);
  }

  .ant-table-thead > tr > th {
    height: 67px;
    //text-align: left !important;
  }

  .ant-table-tbody > tr > td:first-child {
    border-left: 0px;
  }

  .ant-table-tbody > tr > td:not(:last-child) {
    border-right: 1px solid rgba(#ffffff, 0.1);
  }

  .ant-table-tbody > tr > td {
    height: 67px;
  }

  .ant-table-tbody > tr > td:first-child {
    border-left: 0;
  }

  .ant-table-tbody > tr:last-child > td {
    border-bottom: 0px;
  }

  .ant-table-placeholder {
    border-bottom: 0px;
    margin-right: 6px;
  }

  .ant-empty-image {
    svg {
      display: none;
    }
  }

  .ant-table-row-cell-ellipsis:hover,
  .ant-table-header-column:hover {
    cursor: default;
  }

  .btn-secondary:hover,
  .btn-ghost:hover {
    border: none !important;
    border-radius: 0px !important;
  }
}
</style>
