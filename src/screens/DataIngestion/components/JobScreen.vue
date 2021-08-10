<template>
  <div class="h-100">
    <div class="right-panel-title d-flex justify-content-between align-items-center">
      <div class="title">Jobs</div>
      <DiButton :id="genBtnId('add-job')" title="Add Job" @click="openDataSourceSelectionModal">
        <img class="icon-title" src="@/assets/icon/ic_add.svg" />
      </DiButton>
    </div>
    <div v-if="isLoaded && isEmptyData" class="no-data">
      <div class="icon">
        <img width="60" height="60" src="@/assets/icon/data_ingestion/ic_job.svg" alt="" />
      </div>
      <div class="title">
        No data yet
      </div>
      <div class="action">
        <a href="#" class="font-weight-bold" @click.stop="openDataSourceSelectionModal">Click here</a>
        to add Job
      </div>
    </div>
    <DataIngestionTable
      v-else
      class="data-ingestion-table"
      :status="listJobStatus"
      :headers="jobHeaders"
      :records="jobRecords"
      :error-message="tableErrorMessage"
      :total="record"
      @reTry="loadJobs"
      @onPageChange="handlePageChange"
    ></DataIngestionTable>
    <DataSourceSelectionModal :is-show.sync="isShowDataSourceSelectionModal" @onSubmit="handleSelectDataSource"></DataSourceSelectionModal>
    <JobConfigModal :is-show.sync="isShowJobConfigModal" :job-config-form-render="jobFormRenderer" @ok="handleSubmitJob"></JobConfigModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { CustomCell, HeaderData, IndexedHeaderData, Pagination, RowData } from '@/shared/models';
import DataSourceSelectionModal from '@/screens/DataIngestion/components/DataSourceSelectionModal.vue';
import JobConfigModal from '@/screens/DataIngestion/components/JobConfigModal.vue';
import { JobModule } from '@/screens/DataIngestion/store/JobStore';
import { Status } from '@/shared';
import { Log } from '@core/utils';
import { HtmlElementRenderUtils } from '@/utils/HtmlElementRenderUtils';
import { Job, JobInfo } from '@core/DataIngestion/Domain/Job/Job';
import { Modals } from '@/utils/modals';
import { PopupUtils } from '@/utils/popup.utils';
import { JobFormRender } from '@/screens/DataIngestion/FormBuilder/JobFormRender';
import { JobFormFactory } from '@/screens/DataIngestion/FormBuilder/JobFormFactory';
import { DataSourceInfo } from '@core/DataIngestion/Domain/DataSource/DataSourceInfo';
import { FormMode, JobStatus } from '@core/DataIngestion';
import { DIException } from '@core/domain';
import { ListUtils } from '@/utils';
import { AtomicAction } from '@/shared/anotation/AtomicAction';
import DataIngestionTable from '@/screens/DataIngestion/components/DataIngestionTable.vue';

@Component({
  components: { DataIngestionTable, JobConfigModal, DataSourceSelectionModal }
})
export default class JobScreen extends Vue {
  //todo: add pagination for table
  private isShowJobConfigModal = false;
  private isShowDataSourceSelectionModal = false;
  private jobFormRenderer: JobFormRender = JobFormRender.default();

  private from = 0;
  private size = 20;
  private listJobStatus: Status = Status.Loading;
  private tableErrorMessage = '';

  private get jobHeaders(): HeaderData[] {
    return JobModule.jobHeaders;
  }

  private get jobRecords(): RowData[] {
    // return [];
    return JobModule.jobList.map(jobInfo => {
      Log.debug('DAtaSource::JobSource::', jobInfo.source);
      //todo: fix on tupe jdbc job else
      return {
        ...jobInfo.job,
        //@ts-ignore
        syncMode: jobInfo.job?.displaySyncMode ?? '--',
        sourceName: jobInfo.source.getDisplayName(),
        customLastSyncStatus: new CustomCell(this.renderLastSyncStatus),
        customCurrentSyncStatus: new CustomCell(this.renderCurrentSyncStatus),
        depth: 0,
        children: [],
        isExpanded: false,
        displayName: jobInfo.job.displayName,
        action: new CustomCell(this.renderJobAction)
      };
    });
  }

  private get record(): number {
    return JobModule.totalRecord;
  }

  private get isLoaded() {
    return this.listJobStatus === Status.Loaded;
  }

  private get isEmptyData(): boolean {
    return ListUtils.isEmpty(this.jobRecords);
  }

  async created() {
    await this.loadJobs();
  }

  private openDataSourceSelectionModal() {
    this.isShowDataSourceSelectionModal = true;
  }

  private handleSelectDataSource(dataSource: DataSourceInfo) {
    try {
      Log.debug('JobScreen::handleSubmitDataSource::dataSource::', dataSource);
      const job: Job = Job.default(dataSource);
      const jobInfo: JobInfo = new JobInfo(job, dataSource);
      this.openJobConfigModal(jobInfo);
    } catch (e) {
      const exception = DIException.fromObject(e);
      Log.error('JobScreen::handleSelectDataSource::exception', exception.message);
    }
  }

  private openJobConfigModal(jobInfo: JobInfo) {
    this.isShowJobConfigModal = true;
    this.jobFormRenderer = new JobFormFactory().createRender(jobInfo);
  }

  private async loadJobs() {
    try {
      this.listJobStatus = Status.Loading;
      await JobModule.loadJobList({ from: this.from, size: this.size });
      this.showLoaded();
    } catch (e) {
      const exception = DIException.fromObject(e);
      this.showError(exception.message);
      Log.error('JobScreen::loadJobs::exception::', exception.message);
      throw new DIException(exception.message);
    }
  }

  private async reloadJobs() {
    await JobModule.loadJobList({ from: this.from, size: this.size });
  }

  private handleConfirmDeleteJob(job: Job) {
    Modals.showConfirmationModal(`Are you sure to delete job '${job.displayName}'?`, { onOk: () => this.handleDeleteJob(job) });
  }

  @AtomicAction()
  private async handleDeleteJob(job: Job) {
    try {
      this.showUpdating();
      await JobModule.deleteJob(job.jobId);
      await this.reloadJobs();
    } catch (e) {
      const exception = DIException.fromObject(e);
      PopupUtils.showError(exception.message);
    } finally {
      this.showLoaded();
    }
  }

  private async handleForceSync(job: Job) {
    try {
      this.showUpdating();
      const response = await JobModule.forceSync(job);
      if (response) {
        PopupUtils.showSuccess('Force sync successfully.');
        await this.reloadJobs();
      } else {
        PopupUtils.showError('Force sync failed.');
      }
      Log.debug('JobScreen::handleForceSync::job::', job, response);
    } catch (e) {
      const exception = DIException.fromObject(e);
      PopupUtils.showError(exception.message);
      Log.error('JobScreen::handleForceSync::exception', exception.message);
    } finally {
      this.showLoaded();
    }
  }

  private renderJobAction(rowData: RowData, rowIndex: number, header: IndexedHeaderData, columnIndex: number): HTMLElement {
    const job: Job = Job.fromObject(rowData);
    const deleteButton = HtmlElementRenderUtils.buildButton('Delete', 'ic_delete.svg', () => this.handleConfirmDeleteJob(job));
    const forceSyncButton = HtmlElementRenderUtils.buildButton('Force Sync', 'ic_edit.svg', () => this.handleForceSync(job));
    return HtmlElementRenderUtils.renderAction([deleteButton, forceSyncButton]);
  }

  @AtomicAction()
  private async handleSubmitJob() {
    try {
      this.showUpdating();
      const job: Job = this.jobFormRenderer.createJob();
      Log.debug('Submit Job', job);
      await this.submitJob(job);
      await this.reloadJobs();
    } catch (e) {
      const exception = DIException.fromObject(e);
      PopupUtils.showError(exception.message);
      Log.error('JobScreen::handleSubmitJob::exception::', exception.message);
    } finally {
      this.showLoaded();
    }
  }

  private showUpdating() {
    this.listJobStatus = Status.Updating;
  }

  private showLoaded() {
    this.listJobStatus = Status.Loaded;
  }

  private showError(message: string) {
    this.listJobStatus = Status.Error;
    this.tableErrorMessage = message;
  }

  private async submitJob(job: Job) {
    const jobConfigFormMode: FormMode = Job.getJobFormConfigMode(job);
    switch (jobConfigFormMode) {
      case FormMode.Create:
        await JobModule.create(job);
        break;
      case FormMode.Edit:
        await JobModule.update(job);
        break;
      default:
        throw new DIException(`Unsupported ${jobConfigFormMode} Job`);
    }
  }

  private renderLastSyncStatus(rowData: RowData): HTMLElement {
    const status: JobStatus = Job.fromObject(rowData).lastSyncStatus;
    const color = Job.getColorFromStatus(status);
    return HtmlElementRenderUtils.buildTextColor(status, color);
  }

  private renderCurrentSyncStatus(rowData: RowData): HTMLElement {
    const job: Job = Job.fromObject(rowData);
    return job.displayCurrentStatus();
  }

  private async handlePageChange(pagination: Pagination) {
    try {
      this.showUpdating();
      this.from = (pagination.page - 1) * pagination.rowsPerPage;
      this.size = pagination.rowsPerPage;
      await this.reloadJobs();
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

.data-ingestion-table {
  height: calc(100% - 71px) !important;
}

.no-data {
  height: calc(100% - 71px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  .title {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: bold;
  }
  a {
    text-decoration: underline;
  }
}
</style>
