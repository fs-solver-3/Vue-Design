<template>
  <BModal
    v-model="isShowSync"
    class="position-relative"
    :ok-title="okTitle"
    centered
    size="lg"
    :hide-header="true"
    @ok="handleSubmit"
    @show="onShowModal"
    :ok-disabled="isNotSuccessConnection"
  >
    <img class="btn-close btn-ghost position-absolute" src="@/assets/icon/ic_close.svg" alt="" @click="closeModal" />
    <div class="modal-title text-center">DataSource Config</div>
    <div class="modal-sub-title text-center">Config information of DataSource</div>

    <div class="d-flex flex-column justify-content-center">
      <DataSourceConfigForm :form-render="dataSourceRender"></DataSourceConfigForm>
      <div class="form-item d-flex w-100 justify-content-center align-items-center">
        <div class="title"></div>
        <div class="input d-flex justify-content-between">
          <TestConnection :status="connectionStatus" @handleTestConnection="handleTestConnection"></TestConnection>
        </div>
      </div>
    </div>
  </BModal>
</template>

<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator';
import DiCustomModal from '@/shared/components/DiCustomModal.vue';
import DiButton from '@/shared/components/DiButton.vue';
import MessageContainer from '@/shared/components/MessageContainer.vue';
import { Log } from '@core/utils';
import { DataSourceConfigForm } from '@/screens/DataIngestion/components/DataSourceConfigForm/DataSourceConfigForm';
import { DataSourceInfo } from '@core/DataIngestion/Domain/DataSource/DataSourceInfo';
import { DataSourceModule } from '@/screens/DataIngestion/store/DataSourceStore';
import { DataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/DataSourceFormRender';
import TestConnection, { ConnectionStatus } from '@/screens/DataIngestion/components/TestConnection.vue';
import { DIException } from '@core/domain';
import { AtomicAction } from '@/shared/anotation/AtomicAction';

@Component({
  components: { TestConnection, MessageContainer, DiButton, DiCustomModal, DataSourceConfigForm }
})
export default class DataSourceConfigModal extends Vue {
  private static readonly DEFAULT_ID = -1;
  private connectionStatus: ConnectionStatus = ConnectionStatus.Failed;

  @PropSync('isShow', { type: Boolean })
  isShowSync!: boolean;

  @Prop({ required: true })
  private readonly dataSourceRender!: DataSourceFormRender;

  private closeModal() {
    this.isShowSync = false;
  }

  private get isEditMode() {
    return this.dataSourceRender.createDataSourceInfo().id !== DataSourceConfigModal.DEFAULT_ID;
  }

  private get isNotSuccessConnection(): boolean {
    return this.connectionStatus !== ConnectionStatus.Success;
  }

  private get okTitle() {
    return this.isEditMode ? 'Update' : 'Add';
  }

  private async handleSubmit() {
    this.$emit('onClickOk');
  }

  @AtomicAction()
  private async handleTestConnection() {
    try {
      const dataSourceInfo: DataSourceInfo = this.dataSourceRender.createDataSourceInfo();
      Log.debug('DataConfigModal::handleTestConnection::request::', dataSourceInfo);
      this.connectionStatus = ConnectionStatus.Loading;
      const isSuccess = await DataSourceModule.testDataSourceConnection(dataSourceInfo);
      this.updateConnectionStatus(isSuccess);
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      this.connectionStatus = ConnectionStatus.Failed;
      Log.debug('DataSourceConfigModal::handleTestConnection::exception', exception.message);
    }
  }

  private updateConnectionStatus(isSuccess: boolean) {
    if (isSuccess) {
      this.connectionStatus = ConnectionStatus.Success;
    } else {
      this.connectionStatus = ConnectionStatus.Failed;
    }
  }

  private onShowModal() {
    this.reset();
  }

  private reset() {
    this.connectionStatus = ConnectionStatus.Failed;
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';
.modal-title {
  font-size: 16px;
  font-weight: bold;
  padding: 10px 25px 8px 25px;
  line-height: 1.5;
  letter-spacing: 0.4px;
}
.modal-sub-title {
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.4px;
  padding-bottom: 32px;
}

.btn-close {
  top: 12px;
  right: 12px;
  .title {
    width: 0;
  }
}

.form-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 450px;
  //class="item d-flex w-100 justify-content-center align-items-center"

  .title {
    width: 110px;
  }
  .input {
    width: 350px;
    margin-top: 16px;
    input {
      padding-left: 16px;
    }
  }
  .text-connection {
    color: var(--accent);
  }
}
.form-item + .form-item {
  margin-top: 8px;
}

::v-deep {
  .modal-footer {
    width: 460px;
    padding-right: 0;
    padding-left: 0;
    @media (max-width: 500px) {
      width: 100%;
    }
    display: flex;
    margin: auto;
    button {
      flex-basis: 0;
      flex-grow: 1;
      max-width: 100%;
      height: 42px;
    }
  }
}
</style>
