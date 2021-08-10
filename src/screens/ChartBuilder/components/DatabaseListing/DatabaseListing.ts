/*
 * @author: tvc12 - Thien Vi
 * @created: 4/19/21, 1:46 PM
 */

import { Component, Emit, Prop, Ref, Vue } from 'vue-property-decorator';
import { DatabaseInfo, TableSchema } from '@core/domain/Model/Schema';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import { SlTreeNode, SlTreeNodeModel } from '@/shared/components/builder/treemenu/SlVueTree';
import { DomUtils, ListUtils, TimeoutUtils } from '@/utils';
import { StringUtils } from '@/utils/string.utils';

import SlVueTree from '@/shared/components/builder/treemenu/SlVueTree.vue';
import { LabelNode, OnlyVerticalScrollConfigs } from '@/shared';
import CalculatedFieldModal from '@/screens/ChartBuilder/components/DatabaseListing/CalculatedFieldModal.vue';
import VueContext from 'vue-context';
import DataListing from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/DataListing.vue';
import { Column, Field } from '@core/domain/Model';
import { PopupUtils } from '@/utils/popup.utils';
import { DIException } from '@core/domain/Exception';
import { Log } from '@core/utils';
import { DeletCalculatedFieldData } from '@/screens/ChartBuilder/model/CalculatedFieldData';
import { Modals } from '@/utils/modals';

enum DataManagementAction {
  AddCalculatedField = 'add_calculated_field',
  EditCalculatedField = 'edit_calculated_field',
  DeleteCalculatedField = 'delete_calculated_field',
  DeleteTable = 'delete_table'
}

export enum DatabaseListingAs {
  Edit = 'edit',
  Normal = 'normal'
}

@Component({
  components: {
    SlVueTree,
    CalculatedFieldModal,
    VueContext,
    DataListing
  }
})
export default class DatabaseListing extends Vue {
  @Prop({ default: DatabaseListingAs.Normal })
  databaseListingAs!: DatabaseListingAs;
  private options = OnlyVerticalScrollConfigs;
  private enableSearch = false;
  private keyword = '';
  @Ref()
  private readonly tableMenu?: VueContext;

  @Ref()
  private readonly columnMenu?: VueContext;

  @Ref()
  private readonly searchInput?: HTMLInputElement;

  @Ref()
  private readonly calculatedFieldModal?: CalculatedFieldModal;

  get databaseInfos(): DatabaseInfo[] {
    return DatabaseSchemaModule.databaseInfos || [];
  }

  get isShowClearSearchButton(): boolean {
    return StringUtils.isNotEmpty(this.keyword);
  }

  private get tableSchemas(): SlTreeNodeModel<TableSchema>[] {
    if (this.enableSearch && StringUtils.isNotEmpty(this.keyword)) {
      return DatabaseSchemaModule.searchDatabaseSchemas(this.keyword);
    }
    return DatabaseSchemaModule.tableSchemas;
  }

  private get haveDatabase() {
    return ListUtils.isNotEmpty(DatabaseSchemaModule.databaseInfos);
  }

  private get tableActions(): LabelNode[] {
    switch (this.databaseListingAs) {
      case DatabaseListingAs.Normal:
        return [{ label: 'Add calculated field', type: DataManagementAction.AddCalculatedField.toString() }];
      case DatabaseListingAs.Edit:
        return [
          { label: 'Add calculated field', type: DataManagementAction.AddCalculatedField.toString() },
          { label: 'Delete', type: DataManagementAction.DeleteTable }
        ];
      default:
        return [];
    }
  }

  private get fieldOptions(): LabelNode[] {
    return [
      {
        label: 'Edit Column',
        type: DataManagementAction.EditCalculatedField.toString()
      },
      {
        label: 'Delete Column',
        type: DataManagementAction.DeleteCalculatedField.toString()
      }
    ];
  }

  private get databaseSelected(): string {
    return DatabaseSchemaModule.dbNameSelected ?? '';
  }

  private set databaseSelected(dbName: string) {
    if (StringUtils.isNotEmpty(dbName) && dbName != this.databaseSelected) {
      DatabaseSchemaModule.selectDatabase(dbName);
    }
  }

  handleUnFocus() {
    if (StringUtils.isEmpty(this.keyword)) {
      this.enableSearch = false;
    }
  }

  private handleDragStart() {
    PopupUtils.hideAllPopup();
    this.setIsDragging(true);
  }

  private handleDragEnd() {
    this.setIsDragging(false);
  }

  @Emit('update:isDragging')
  private setIsDragging(isDragging: boolean): boolean {
    return isDragging;
  }

  private showCreateCalculatedFieldModal(tableSchema: TableSchema): void {
    this.calculatedFieldModal?.showCreateModal(tableSchema);
  }

  private showMoreOption(node: any, event: Event) {
    const tableSchema: TableSchema | undefined = node.parent.tag as TableSchema;
    event.stopPropagation();
    // workaround: use event.stopPropagation(), because other popup will not close.
    PopupUtils.hideAllPopup();
    TimeoutUtils.waitAndExec(
      null,
      () => {
        this.tableMenu?.open(event, { tableSchema: tableSchema });
      },
      80
    );
  }

  private handleConfigTable(tableSchema: TableSchema, node: LabelNode) {
    const selectedAction: string | undefined = node.type as any;
    switch (selectedAction) {
      case DataManagementAction.AddCalculatedField:
        this.showCreateCalculatedFieldModal(tableSchema);
        this.tableMenu?.close();
        break;
      case DataManagementAction.DeleteTable:
        //drop table
        this.tableMenu?.close();
        // this.handleDropTable(tableSchema);
        Modals.showConfirmationModal(`Are you sure to delete table '${tableSchema.displayName}'?`, {
          onOk: () => this.handleDropTable(tableSchema),
          onCancel: () => {
            Log.debug('onCancel');
          }
        });
        break;
    }
  }

  private toggleSearch() {
    this.enableSearch = !this.enableSearch;
  }

  private handleClearSearchInput() {
    this.keyword = '';
    this.searchInput?.focus();
  }

  private handleRightClickNode(node: SlTreeNode<TableSchema>, event: MouseEvent) {
    const field: Field | undefined = node.tag as Field;
    const tableSchema: TableSchema | undefined = node.data as TableSchema;
    const column: Column | undefined = tableSchema?.columns[node.ind];

    const canShowMenu = node.isLeaf && field && tableSchema && column && column.isMaterialized();

    if (canShowMenu) {
      event.preventDefault();
      this.columnMenu?.open(event, { column: column, tableSchema: tableSchema, field: Field });
    }
  }

  private handleConfigColumn(tableSchema: TableSchema, column: Column, node: LabelNode) {
    const selectedAction: DataManagementAction | undefined = node.type as any;

    switch (selectedAction) {
      case DataManagementAction.DeleteCalculatedField:
        this.deleteCalculatedField(tableSchema, column);
        break;
      case DataManagementAction.EditCalculatedField:
        this.editCalculatedField(tableSchema, column);
        break;
    }

    this.columnMenu?.close();
  }

  private async deleteCalculatedField(tableSchema: TableSchema, column: Column): Promise<void> {
    try {
      const deletingFieldData: DeletCalculatedFieldData = {
        dbName: tableSchema.dbName,
        tblName: tableSchema.name,
        fieldName: column.name
      };
      await DatabaseSchemaModule.deleteCalculatedField(deletingFieldData);
      await DatabaseSchemaModule.reload(deletingFieldData.dbName);
    } catch (ex) {
      PopupUtils.showError(`Can not delete column ${column.displayName}`);

      const exception = DIException.fromObject(ex);
      Log.error('deleteCalculatedField::exception', exception);
    }
  }

  private editCalculatedField(tableSchema: TableSchema, column: Column) {
    this.calculatedFieldModal?.showEditModal(tableSchema, column);
  }

  private handleDropTable(tableSchema: TableSchema) {
    DatabaseSchemaModule.dropTable({ dbName: tableSchema.dbName, tblName: tableSchema.name })
      .then(isSuccess => {
        if (isSuccess) {
          DatabaseSchemaModule.selectDatabase(tableSchema.dbName);
        } else {
          PopupUtils.showError(`Can't delete ${tableSchema.displayName}`);
          return Promise.reject(new DIException(`Can't delete ${tableSchema.displayName}`));
        }
      })
      .catch(err => {
        PopupUtils.showError(err.message);
      });
  }
}
