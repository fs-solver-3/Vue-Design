<template>
  <DiCustomModal class="di-modal" ref="customModal" ok-title="Create" size="md" title="Create Database" @onClickOk="handleClickOk">
    <div class="create-table-modal-container">
      <div class="d-flex align-items-center">
        <div class="title">Database Name:</div>
        <div class="fill-content">
          <b-input v-model="dbDisplayName" placeholder="table name" type="text" />
          <div v-if="$v.dbDisplayName.$error">
            <div v-if="!$v.dbDisplayName.required" class="error-message">Field table name is required.</div>
          </div>
        </div>
      </div>
    </div>
  </DiCustomModal>
</template>

<script lang="ts">
import DiCustomModal from '@/shared/components/DiCustomModal.vue';
import { Component, Ref, Vue } from 'vue-property-decorator';
import { Log } from '@core/utils';
import { DatabaseInfo } from '@core/domain/Model';
import { required } from 'vuelidate/lib/validators';
import { DataManagementModule } from '@/screens/DataManagement/store/data_management.store';
import MessageContainer from '@/shared/components/MessageContainer.vue';
import { PopupUtils } from '@/utils/popup.utils';

@Component({
  components: { MessageContainer, DiCustomModal },
  validations: {
    dbDisplayName: { required }
  }
})
export default class DatabaseCreationModal extends Vue {
  private dbDisplayName = '';

  @Ref()
  private readonly customModal?: DiCustomModal;

  show() {
    this.customModal?.show();
    this.reset();
  }
  hide() {
    this.customModal?.hide();
    this.reset();
  }

  handleClickOk(e: MouseEvent) {
    e.preventDefault();
    if (this.validateModal()) {
      DataManagementModule.createDatabase(this.dbDisplayName)
        .then(databaseInfo => this.handleOnCreateDatabaseSuccess(databaseInfo))
        .catch(error => {
          Log.error('CreateTableFromQueryModal::handleClickOk::error::', error.message);
          PopupUtils.showError(error.message);
        });
    }
  }

  validateModal() {
    this.$v.$touch();
    if (this.$v.$invalid) {
      return false;
    }
    return true;
  }

  reset() {
    this.dbDisplayName = '';
    this.$v.$reset();
  }

  handleOnCreateDatabaseSuccess(databaseInfo: DatabaseInfo) {
    this.hide();
    DataManagementModule.searchAndSelectDatabase(databaseInfo.name);
  }
}
</script>

<style lang="scss" scoped>
.fill-content {
  width: calc(100% - 120px);
}
.create-table-modal-container {
  padding: 0 10%;
  .title {
    width: 120px;
  }
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
