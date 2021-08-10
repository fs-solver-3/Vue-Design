<template>
  <div class="h-100">
    <div class="right-panel-title d-flex justify-content-between align-items-center">
      <div class="title">Job History</div>
    </div>
    <div v-if="isLoaded && isEmptyData" class="no-data">
      <div class="icon">
        <img width="60" height="60" src="@/assets/icon/data_ingestion/ic_job_history.svg" alt="" />
      </div>
      <div class="title">
        No data yet
      </div>
    </div>
    <DataIngestionTable
      v-else
      class="data-ingestion-table"
      :status="listJobHistoryStatus"
      :headers="jobHistoryHeaders"
      :records="jobHistoryRecords"
      :error-message="tableErrorMessage"
      :total="record"
      @reTry="loadJobHistories"
      @onPageChange="handlePageChange"
    ></DataIngestionTable>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { CustomCell, HeaderData, Pagination, RowData } from '@/shared/models';
import DataSourceSelectionModal from '@/screens/DataIngestion/components/DataSourceSelectionModal.vue';
import JobConfigModal from '@/screens/DataIngestion/components/JobConfigModal.vue';
import { Status } from '@/shared';
import { Log } from '@core/utils';
import { JobHistory, JobStatus } from '@core/DataIngestion';
import { JobHistoryModule } from '@/screens/DataIngestion/store/JobHistoryStore';
import { HtmlElementRenderUtils } from '@/utils/HtmlElementRenderUtils';
import moment from 'moment';
import { DIException } from '@core/domain';
import { FormatDateTime, ListUtils } from '@/utils';
import DataIngestionTable from '@/screens/DataIngestion/components/DataIngestionTable.vue';
import { StringUtils } from '@/utils/string.utils';

@Component({
  components: { DataIngestionTable, JobConfigModal, DataSourceSelectionModal }
})
export default class JobHistoryScreen extends Vue {
  private from = 0;
  private size = 20;

  private listJobHistoryStatus: Status = Status.Loading;
  private tableErrorMessage = '';

  private get jobHistoryHeaders(): HeaderData[] {
    return JobHistoryModule.jobHistoryHeaders;
  }

  private get jobHistoryRecords(): RowData[] {
    return JobHistoryModule.jobHistoryList.map(jobHistory => {
      Log.debug('totalSyncTime::', jobHistory.totalSyncedTime);
      return {
        ...jobHistory,
        totalSyncedTime: FormatDateTime.formatAsHms(jobHistory.totalSyncedTime),
        lastSyncTime: FormatDateTime.formatAsDDMMYYYYHms(jobHistory.lastSyncTime),
        message: StringUtils.isEmpty(jobHistory.message) ? '--' : jobHistory.message,
        depth: 0,
        children: [],
        isExpanded: false,
        customStatus: new CustomCell(this.renderStatus)
      };
    });
  }

  private get record(): number {
    return JobHistoryModule.totalRecord;
  }

  private get isLoaded() {
    return this.listJobHistoryStatus === Status.Loaded;
  }

  private get isEmptyData(): boolean {
    return ListUtils.isEmpty(this.jobHistoryRecords);
  }

  async created() {
    await this.loadJobHistories();
  }

  private async loadJobHistories() {
    try {
      this.listJobHistoryStatus = Status.Loading;
      await JobHistoryModule.loadJobHistoryList({ from: this.from, size: this.size });
      this.listJobHistoryStatus = Status.Loaded;
    } catch (e) {
      this.listJobHistoryStatus = Status.Error;
      const exception = DIException.fromObject(e);
      this.tableErrorMessage = exception.message;
      throw new DIException(exception.message);
    }
  }

  private renderStatus(rowData: RowData): HTMLElement {
    const status: JobStatus = JobHistory.fromObject(rowData).syncStatus;
    const color = this.getColorFromStatus(status);
    return HtmlElementRenderUtils.buildTextColor(status, color);
  }

  private getColorFromStatus(status: JobStatus): string {
    switch (status) {
      case JobStatus.Initialized:
        return '#ffc14e';
      case JobStatus.Synced:
        return '#4eff86';
      case JobStatus.Syncing:
        return '#4e8aff';
      case JobStatus.Error:
        return '#ff6b4e';
      default:
        return '#9f9f9f';
    }
  }

  private async handlePageChange(pagination: Pagination) {
    try {
      this.from = (pagination.page - 1) * pagination.rowsPerPage;
      this.size = pagination.rowsPerPage;
      await this.loadJobHistories();
    } catch (e) {
      Log.error(`UserProfile paging getting an error: ${e?.message}`);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';

.right-panel-title {
  .title {
    @include bold-text();
    font-size: 16px;
    height: 37px;
    display: flex;
    align-items: center;
  }
  margin-bottom: 24px !important;
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
