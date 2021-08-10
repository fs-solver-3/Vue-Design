import { Component, Ref, Vue } from 'vue-property-decorator';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import DiButton from '@/shared/components/DiButton.vue';
import { FormulaController } from '@/shared/fomula/FormulaController';
import FormulaCompletionInput from '@/shared/components/FormulaCompletionInput/FormulaCompletionInput.vue';
import TableCreationFromQueryModal from '@/screens/DataManagement/components/TableCreationFromQueryModal.vue';
import ChartContainer from '@/screens/DashboardDetail/components/WidgetContainer/charts/ChartContainer.vue';
import { ChartInfo, Column, Field, TableSchema } from '@core/domain/Model';
import { DataManagementModule } from '@/screens/DataManagement/store/data_management.store';
import DataComponents from '@/screens/DataManagement/components/data_component';
import { FormulaSuggestionModule } from '@/screens/ChartBuilder/stores/FormulaSuggestionStore';
import { QueryFormulaController } from '@/shared/fomula/QueryFormulaController';
import DatabaseTreeView from '@/screens/DataManagement/components/DatabaseTreeView/DatabaseTreeView.vue';
import DataManagementChild from '@/screens/DataManagement/views/DataManagementChild';
import DatabaseCreationModal from '@/screens/DataManagement/components/DatabaseCreationModal.vue';
import { LabelNode } from '@/shared';
import CalculatedFieldModal from '@/screens/ChartBuilder/components/DatabaseListing/CalculatedFieldModal.vue';
import VueContext from 'vue-context';
import DataListing from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/DataListing.vue';
import { Modals } from '@/utils/modals';
import { Log } from '@core/utils';
import { PopupUtils } from '@/utils/popup.utils';
import { DIException } from '@core/domain';
import { DeletCalculatedFieldData } from '@/screens/ChartBuilder/model/CalculatedFieldData';

Vue.use(DataComponents);

type ModalComponentType = {
  show: Function;
};

enum DataManagementAction {
  AddCalculatedField = 'add_calculated_field',
  EditCalculatedField = 'edit_calculated_field',
  DeleteCalculatedField = 'delete_calculated_field',
  DeleteTable = 'delete_table'
}

@Component({
  components: {
    ChartContainer,
    TableCreationFromQueryModal,
    DatabaseTreeView,
    DiButton,
    FormulaCompletionInput,
    DatabaseCreationModal,
    CalculatedFieldModal,
    VueContext,
    DataListing
  }
})
export default class QueryEditor extends DataManagementChild {
  private query = '';
  private formulaController: FormulaController | null = null;
  private isShowTable = false;

  @Ref()
  private readonly tableCreationModal!: ModalComponentType & TableCreationFromQueryModal;

  @Ref()
  private readonly databaseCreationModal!: ModalComponentType & DatabaseCreationModal;

  @Ref()
  private readonly tableMenu?: VueContext;

  @Ref()
  private readonly columnMenu?: VueContext;

  @Ref()
  private readonly calculatedFieldModal?: CalculatedFieldModal;

  private get tableChartInfo(): ChartInfo {
    return DataManagementModule.tableChartInfo;
  }

  private get tableActions(): LabelNode[] {
    return [
      { label: 'Add calculated field', type: DataManagementAction.AddCalculatedField.toString() },
      { label: 'Delete', type: DataManagementAction.DeleteTable }
    ];
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

  mounted() {
    if (this.onInitedDatabaseSchemas) {
      this.onInitedDatabaseSchemas(this.initFormulaController);
    }
  }

  destroyed() {
    if (this.offInitedDatabaseSchemas) {
      this.offInitedDatabaseSchemas(this.initFormulaController);
    }
  }

  private initFormulaController() {
    FormulaSuggestionModule.initSuggestFunction(['supported_function.json', 'sql_supported_function.json']);
    this.formulaController = new QueryFormulaController(FormulaSuggestionModule.allFunctions, DatabaseSchemaModule.databaseSchemas);
  }

  private showCreateDatabaseModal() {
    this.databaseCreationModal?.show();
  }

  private showCreateModal() {
    if (!this.query.trim()) {
      // @ts-ignore
      this.$alert.fire({
        icon: 'error',
        title: 'Can not create Table from query',
        html: 'Your query is empty. <br>Please re-check query and try again!',
        confirmButtonText: 'OK'
        // showCancelButton: false
      });
      return;
    }
    this.tableCreationModal?.show();
  }

  private showTableContextMenu(event: MouseEvent, table: TableSchema) {
    this.tableMenu?.open(event, { tableSchema: table });
  }

  private showColumnContextMenu(event: MouseEvent, table: TableSchema, column: Column) {
    // const field: Field | undefined = node.tag as Field;
    // const tableSchema: TableSchema | undefined = node.data as TableSchema;
    // const column: Column | undefined = tableSchema?.columns[node.ind];

    // const canShowMenu = node.isLeaf && field && tableSchema && column && column.isMaterialized();

    if (table && column?.isMaterialized()) {
      event.preventDefault();
      this.columnMenu?.open(event, { column: column, tableSchema: table, field: Field });
    }
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

  private showCreateCalculatedFieldModal(tableSchema: TableSchema): void {
    this.calculatedFieldModal?.showCreateModal(tableSchema);
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
      await DatabaseSchemaModule.reload(tableSchema.dbName);
    } catch (ex) {
      PopupUtils.showError(`Can not delete column ${column.displayName}`);

      const exception = DIException.fromObject(ex);
      Log.error('deleteCalculatedField::exception', exception);
    }
  }

  private editCalculatedField(tableSchema: TableSchema, column: Column) {
    this.calculatedFieldModal?.showEditModal(tableSchema, column);
  }

  private async handleQuery() {
    this.isShowTable = true;
    await DataManagementModule.handleQueryTableData(this.query);
  }
}
