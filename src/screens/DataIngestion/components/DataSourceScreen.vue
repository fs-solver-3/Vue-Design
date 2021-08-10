<template>
  <div class="h-100">
    <div class="right-panel-title d-flex justify-content-between align-items-center">
      <div class="title">All DataSource</div>
      <DiButton :id="genBtnId('add-data-source')" title="Add Data" @click="openDatabaseSelection">
        <img class="icon-title" src="@/assets/icon/ic_add.svg" />
      </DiButton>
    </div>

    <div v-if="isLoaded && isEmptyData" class="select-datasource-type-panel d-flex justify-content-center flex-column">
      <div class="title">No data yet</div>
      <div class="sub-title">Select type and add DataSource</div>
      <div class="d-flex justify-content-center">
        <template v-for="(item, index) in allItems">
          <DataSourceItem class="datasource-item" :item="item" :key="index" @onClickItem="handleSelectDataSource"></DataSourceItem>
        </template>
      </div>
    </div>
    <DataIngestionTable
      v-else
      class="data-ingestion-table"
      :status="tableStatus"
      :headers="dataSourceHeaders"
      :records="dataSourceListing"
      :error-message="tableErrorMessage"
      :total="record"
      @reTry="loadDataSourceTable"
      @onPageChange="handlePageChange"
    ></DataIngestionTable>

    <DataSourceTypeSelection :is-show.sync="isShowDatabaseSelectionModal" @onDataSourceTypeSelected="handleSelectDataSource"></DataSourceTypeSelection>

    <DataSourceConfigModal
      :data-source-render="dataSourceFormRender"
      :isShow.sync="isShowDataSourceConfigModal"
      @onClickOk="handleSubmitDataSource"
    ></DataSourceConfigModal>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator';
import { CustomCell, HeaderData, IndexedHeaderData, Pagination, RowData } from '@/shared/models';
import DiButton from '@/shared/components/DiButton.vue';
import DataSourceConfigModal from '@/screens/DataIngestion/components/DataSourceConfigModal.vue';
import DataSourceTypeSelection from '@/screens/DataIngestion/components/DataSourceTypeSelection.vue';
import { ItemData, Status, VisualizationItemData } from '@/shared';
import { DataSourceModule } from '@/screens/DataIngestion/store/DataSourceStore';
import { Log } from '@core/utils';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { DataSourceInfo } from '@core/DataIngestion/Domain/DataSource/DataSourceInfo';

import { Modals } from '@/utils/modals';
import { DataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/DataSourceFormRender';
import { DataSourceFormFactory } from '@/screens/DataIngestion/FormBuilder/DataSourceFormFactory';
import { PopupUtils } from '@/utils/popup.utils';
import { HtmlElementRenderUtils } from '@/utils/HtmlElementRenderUtils';
import { DataSourceType } from '@core/DataIngestion/Domain/DataSource/DataSourceType';
import { ALL_DATASOURCE } from '@/screens/DataIngestion/constants/datasource.constants';
import { ListUtils } from '@/utils';
import DataSourceItem from '@/screens/DataIngestion/components/DataSourceItem.vue';
import { FormMode } from '@core/DataIngestion';
import { DIException } from '@core/domain';
import { AtomicAction } from '@/shared/anotation/AtomicAction';
import DataIngestionTable from '@/screens/DataIngestion/components/DataIngestionTable.vue';
import DiUploadDocumentActions from '@/screens/DataIngestion/components/DiUploadDocument/actions';

@Component({
  components: { DataIngestionTable, DataSourceItem, StatusWidget, DataSourceTypeSelection, DataSourceConfigModal, DiButton }
})
export default class DataSourceScreen extends Vue {
  private readonly allItems: ItemData[] = ALL_DATASOURCE;
  private from = 0;
  private size = 20;

  private isShowDatabaseSelectionModal = false;
  private isShowDataSourceConfigModal = false;
  private tableErrorMessage = '';
  private tableStatus: Status = Status.Loading;
  private dataSourceFormRender: DataSourceFormRender = new DataSourceFormFactory().createRender(DataSourceInfo.default(DataSourceType.MySql));

  private get dataSourceHeaders(): HeaderData[] {
    return DataSourceModule.dataSourceHeaders;
  }

  private get record(): number {
    return DataSourceModule.totalRecord;
  }

  private get dataSources(): DataSourceInfo[] {
    return DataSourceModule.dataSources;
    // return []
  }

  private get isLoaded() {
    return this.tableStatus === Status.Loaded;
  }

  private get isEmptyData(): boolean {
    return ListUtils.isEmpty(this.dataSources);
  }

  private get dataSourceListing(): RowData[] {
    return this.dataSources.map(dataSource => {
      return {
        ...dataSource,
        isExpanded: false,
        children: [],
        depth: 0,
        action: new CustomCell(this.renderDataSourceAction)
      };
    });
  }

  async created() {
    await this.loadDataSourceTable();
  }

  private renderDataSourceAction(rowData: RowData, rowIndex: number, header: IndexedHeaderData, columnIndex: number): HTMLElement {
    const dataSource = DataSourceInfo.fromObject(rowData);
    const buttonDelete = HtmlElementRenderUtils.buildButton('Delete', 'ic_delete.svg', () => this.handleConfirmDeleteDataSource(dataSource));
    const buttonEdit = HtmlElementRenderUtils.buildButton('Edit', 'ic_edit.svg', () => this.handleEditDataSource(dataSource));
    return HtmlElementRenderUtils.renderAction([buttonDelete, buttonEdit]);
  }

  private handleConfirmDeleteDataSource(dataSource: DataSourceInfo) {
    Log.debug('onClickDeleteInRow::', dataSource.id, dataSource.sourceType);
    Modals.showConfirmationModal(`Are you sure to delete data source '${dataSource.getDisplayName()}'?`, {
      onOk: () => this.handleDeleteDataSource(dataSource)
    });
  }

  private async handleDeleteDataSource(dataSource: DataSourceInfo) {
    try {
      this.showUpdating();
      await DataSourceModule.deleteDataSource(dataSource.id);
      await this.reloadDataSources();
    } catch (e) {
      const exception = DIException.fromObject(e);
      PopupUtils.showError(exception.message);
      Log.error('DataSourceScreen::deleteDataSource::error::', e.message);
    } finally {
      this.showLoaded();
    }
  }
  private openDataSourceForm(dataSource: DataSourceInfo) {
    this.isShowDataSourceConfigModal = true;
    this.dataSourceFormRender = new DataSourceFormFactory().createRender(dataSource);
  }

  private openDatabaseSelection() {
    this.isShowDatabaseSelectionModal = true;
  }

  private closeDatabaseSelection() {
    this.isShowDatabaseSelectionModal = false;
  }

  private handleEditDataSource(dataSource: DataSourceInfo) {
    this.openDataSourceForm(dataSource);
    Log.debug('onClickEditInRow::', dataSource);
  }

  private handleSelectDataSource(selectedItem: VisualizationItemData) {
    try {
      this.closeDatabaseSelection();
      if (selectedItem.type === 'csv') {
        DiUploadDocumentActions.showUploadDocument();
      } else {
        const defaultDataSource = DataSourceInfo.default(selectedItem.type as DataSourceType);
        Log.debug('handleSelected::faultDataSource::', defaultDataSource);
        this.openDataSourceForm(defaultDataSource);
      }
    } catch (e) {
      const exception = DIException.fromObject(e);
      PopupUtils.showError(exception.message);
      Log.error('DataSourceConfigModal::handleSelectDataSource::exception::', exception.message);
    }
  }
  @AtomicAction()
  private async handleSubmitDataSource() {
    try {
      this.showUpdating();
      const sourceInfo: DataSourceInfo = this.dataSourceFormRender.createDataSourceInfo();
      Log.debug('handleSubmitDatasource::sourceInfo::', sourceInfo);
      await this.submitDataSource(sourceInfo);
      await this.reloadDataSources();
    } catch (e) {
      const exception = DIException.fromObject(e);
      PopupUtils.showError(exception.message);
      Log.error('DataSourceConfigModal::handleClickOk::exception::', exception.message);
    } finally {
      this.showLoaded();
    }
  }

  private async submitDataSource(sourceInfo: DataSourceInfo) {
    const action = this.getDataSourceConfigMode(sourceInfo);
    switch (action) {
      case FormMode.Edit: {
        await DataSourceModule.editDataSource(sourceInfo);
        break;
      }
      case FormMode.Create: {
        await DataSourceModule.createDataSource(sourceInfo);
        break;
      }
      default:
        throw new DIException(`Unsupported DataSourceConfigMode ${action}`);
    }
  }

  private getDataSourceConfigMode(dataSource: DataSourceInfo): FormMode {
    switch (dataSource.id) {
      case DataSourceInfo.DEFAULT_ID:
        return FormMode.Create;
      default:
        return FormMode.Edit;
    }
  }

  private async loadDataSourceTable() {
    try {
      this.tableStatus = Status.Loading;
      await DataSourceModule.loadDataSources({ from: this.from, size: this.size });
      this.tableStatus = Status.Loaded;
    } catch (e) {
      const exception = DIException.fromObject(e);
      this.showError(exception.message);
      Log.error('DataSourceScreen::loadDataSourceTable::exception::', exception.message);
      throw new DIException(exception.message);
    }
  }

  private async reloadDataSources() {
    await DataSourceModule.loadDataSources({ from: this.from, size: this.size });
  }

  private showUpdating() {
    this.tableStatus = Status.Updating;
  }

  private showLoaded() {
    this.tableStatus = Status.Loaded;
  }

  private showError(message: string) {
    this.tableStatus = Status.Error;
    this.tableErrorMessage = message;
  }

  private async handlePageChange(pagination: Pagination) {
    try {
      this.showUpdating();
      this.from = (pagination.page - 1) * pagination.rowsPerPage;
      this.size = pagination.rowsPerPage;
      await this.reloadDataSources();
      this.showLoaded();
    } catch (e) {
      Log.error(`UserProfile paging getting an error: ${e?.message}`);
      this.showError(e.message);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';

.right-panel-title {
  .title {
    @include bold-text-16();
  }

  margin-bottom: 24px;
}

.select-datasource-type-panel {
  .title {
    @include bold-text-16();
    padding-top: 24px;
    padding-bottom: 8px;
    line-height: 24px;
  }
  .sub-title {
    @include regular-text();
    font-size: 16px;
    opacity: 0.6;
    margin-bottom: 40px;
    line-height: 24px;
  }
  .datasource-item {
    ::v-deep {
      .title {
        background: var(--charcoal);
      }
    }
  }
}

.data-ingestion-table {
  height: calc(100% - 71px);
}
</style>
