<template>
  <DiCustomCenterModal
    :is-show.sync="isShowSync"
    title="Add Job"
    sub-title="Config information for DataSource"
    :ok-disable="isFailureConnection"
    @ok="handleClickOk"
    @show="onShowModal"
    :ok-title="okTitle"
  >
    <div class="d-flex flex-column">
      <JobConfigForm :render-engine="jobConfigFormRender"></JobConfigForm>
      <div class="job-form-item d-flex w-100 justify-content-center align-items-center">
        <div class="title"></div>
        <div class="input d-flex justify-content-between">
          <TestConnection :status="connectionStatus" @handleTestConnection="handleTestConnection"></TestConnection>
        </div>
      </div>
    </div>
  </DiCustomCenterModal>
</template>

<script lang="ts">
import { Component, Prop, PropSync, Vue } from 'vue-property-decorator';
import DiCustomCenterModal from '@/screens/DataIngestion/components/DiCustomCenterModal.vue';
import { JobFormRender } from '@/screens/DataIngestion/FormBuilder/JobFormRender';
import { JobConfigForm } from '@/screens/DataIngestion/components/DataSourceConfigForm/JobConfigForm';
import TestConnection, { ConnectionStatus } from '@/screens/DataIngestion/components/TestConnection.vue';
import { Log } from '@core/utils';
import { Job } from '@core/DataIngestion/Domain/Job/Job';
import { JobModule } from '@/screens/DataIngestion/store/JobStore';
import { FormMode } from '@core/DataIngestion/Domain/Job/FormMode';
import { DIException } from '@core/domain';
import { AtomicAction } from '@/shared/anotation/AtomicAction';
import '@/screens/DataIngestion/components/DataSourceConfigForm/scss/job_form.scss';

@Component({
  components: { TestConnection, DiCustomCenterModal, JobConfigForm }
})
export default class JobConfigModal extends Vue {
  private connectionStatus: ConnectionStatus = ConnectionStatus.Failed;

  @Prop({ required: true })
  private jobConfigFormRender!: JobFormRender;

  @PropSync('isShow', { type: Boolean })
  isShowSync!: boolean;

  private get okTitle(): string {
    const job: Job = this.jobConfigFormRender.createJob();
    const mode: FormMode = Job.getJobFormConfigMode(job);
    switch (mode) {
      case FormMode.Edit:
        return 'Update';
      case FormMode.Create:
        return 'OK';
      default:
        throw new DIException(`Unsupported form mode ${mode}`);
    }
  }

  private get isFailureConnection(): boolean {
    return this.connectionStatus !== ConnectionStatus.Success;
  }

  private handleClickOk() {
    this.$emit('ok');
  }
  @AtomicAction()
  private async handleTestConnection() {
    try {
      const job: Job = this.jobConfigFormRender.createJob();
      Log.debug('JobConfigModal::handleTestConnection::request::', job);
      this.connectionStatus = ConnectionStatus.Loading;
      const isSuccess = await JobModule.testJobConnection(job);
      this.updateConnectionStatus(isSuccess);
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      this.connectionStatus = ConnectionStatus.Failed;
      Log.debug('JobConfigModal::handleTestConnection::exception', exception.message);
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

.input {
  margin-top: 16px;
}
</style>
