<template>
  <DiCustomModal ref="createModal" class="di-modal" ok-title="Create" size="md" title="Create Table From Query" @onClickOk="handleCreateTable">
    <div class="create-table-modal-container">
      <div class="d-flex flex-wrap align-items-center">
        <div class="title">To Database:</div>
        <div class="fill-content">
          <DiDropdown
            :id="genDropdownId('to-databases')"
            v-model="selectedDatabase"
            :data="databaseInfos"
            class="database-select"
            labelProps="displayName"
            placeholder="Select database"
            valueProps="name"
          ></DiDropdown>
          <span v-if="$v.selectedDatabase.$error">
            <div v-if="!$v.selectedDatabase.required" class="error-message">Field database name is required.</div>
          </span>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <div class="title">Table Name:</div>
        <div class="fill-content">
          <b-input v-model="tableDisplayName" placeholder="table name" type="text" />
          <div v-if="$v.tableDisplayName.$error">
            <div v-if="!$v.tableDisplayName.required" class="error-message">Field table name is required.</div>
          </div>
        </div>
      </div>
    </div>
  </DiCustomModal>
</template>

<script lang="ts">
import DiCustomModal from '@/shared/components/DiCustomModal.vue';
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import { DatabaseInfo, TableSchema } from '@core/domain/Model';
import { required } from 'vuelidate/lib/validators';
import { DataManagementModule } from '@/screens/DataManagement/store/data_management.store';
import MessageContainer from '@/shared/components/MessageContainer.vue';
import { PopupUtils } from '@/utils/popup.utils';
import { DIException } from '@core/domain/Exception';

@Component({
  components: { MessageContainer, DiCustomModal },
  validations: {
    tableDisplayName: { required },
    selectedDatabase: { required }
  }
})
export default class TableCreationFromQueryModal extends Vue {
  @Prop({ required: true })
  query!: string;
  private tableDisplayName = '';
  private selectedDatabase = this.defaultSelectedDatabase;
  @Ref()
  private createModal?: DiCustomModal;

  get databaseInfos(): DatabaseInfo[] {
    return DatabaseSchemaModule.databaseInfos || [];
  }

  private get defaultSelectedDatabase(): string {
    return DatabaseSchemaModule.dbNameSelected ?? '';
  }

  show() {
    this.createModal?.show();
    this.reset();
  }

  hide() {
    this.createModal?.hide();
    this.reset();
  }

  handleCreateTable(e: MouseEvent) {
    e.preventDefault();
    if (this.validateTableData()) {
      DataManagementModule.createTableFromQuery({
        dbName: this.selectedDatabase,
        tblDisplayName: this.tableDisplayName,
        query: this.query
      })
        .then(tableSchema => this.handleCreateTableSuccess(tableSchema))
        .catch(this.handleCreateTableError);
    }
  }

  validateTableData() {
    this.$v.$touch();
    if (this.$v.$invalid) {
      return false;
    }
    return true;
  }

  reset() {
    this.tableDisplayName = '';
    this.$v.$reset();
  }

  private handleCreateTableError(ex: any) {
    const exception = DIException.fromObject(ex);
    PopupUtils.showError(exception.message);
  }

  private handleCreateTableSuccess(tableSchema: TableSchema) {
    this.hide();
    DataManagementModule.selectDatabase(tableSchema.dbName);
  }
}
</script>

<style lang="scss" scoped>
.fill-content {
  width: calc(100% - 100px);
}

.title {
  width: 100px;
}

.create-table-modal-container {
  padding: 0 10%;

  > div {
    margin-bottom: 16px;

    &:nth-last-child(1) {
      margin-bottom: 0;
    }
  }

  input {
    height: 34px;
    padding: 10px;
  }
}

.database-select {
  ::v-deep {
    align-items: center;

    button {
      height: 34px;

      > div {
        height: 34px !important;
      }
    }
  }
}

.error-message {
  color: var(--danger);
}

.di-modal {
}
</style>
