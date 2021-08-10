/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:35 PM
 */

import { DataSourceInfo, Job, JobStatus, JobType } from '@core/DataIngestion';
import { JobId, SourceId } from '@core/domain';
import { JobName } from '@core/DataIngestion/Domain/Job/JobName';
import { HtmlElementRenderUtils } from '@/utils/HtmlElementRenderUtils';

export enum SyncMode {
  FullSync = 'FullSync',
  IncrementalSync = 'IncrementalSync'
}

export class JdbcJob implements Job {
  className = JobName.Jdbc;
  displayName: string;
  jobType = JobType.Jdbc;
  jobId: JobId;
  sourceId: SourceId;
  syncMode: SyncMode;
  lastSuccessfulSync: number;
  syncIntervalInMn: number;
  lastSyncStatus: JobStatus;
  currentSyncStatus: JobStatus;
  databaseName: string;
  tableName: string;
  destDatabase: string;
  destTable: string;
  maxFetchSize: number;
  incrementalColumn?: string;
  lastSyncedValue?: string;

  constructor(
    jobId: JobId,
    displayName: string,
    sourceId: SourceId,
    syncMode: SyncMode,
    lastSuccessfulSync: number,
    syncIntervalInMn: number,
    lastSyncStatus: JobStatus,
    currentSyncStatus: JobStatus,
    databaseName: string,
    tableName: string,
    maxFetchSize: number,
    incrementalColumn?: string,
    lastSyncedValue?: string
  ) {
    this.jobId = jobId;
    this.displayName = displayName;
    this.sourceId = sourceId;
    this.syncMode = syncMode;
    this.lastSuccessfulSync = lastSuccessfulSync;
    this.syncIntervalInMn = syncIntervalInMn;
    this.lastSyncStatus = lastSyncStatus;
    this.currentSyncStatus = currentSyncStatus;
    this.databaseName = databaseName;
    this.tableName = tableName;
    this.destDatabase = databaseName;
    this.destTable = tableName;
    this.incrementalColumn = incrementalColumn;
    this.lastSyncedValue = lastSyncedValue;
    this.maxFetchSize = maxFetchSize;
  }

  get displaySyncMode(): string {
    switch (this.syncMode) {
      case SyncMode.FullSync:
        return 'Full sync';
      case SyncMode.IncrementalSync:
        return 'Incremental sync';
      default:
        return '--';
    }
  }

  static fromObject(obj: any): JdbcJob {
    return new JdbcJob(
      obj.jobId,
      obj.displayName,
      obj.sourceId,
      obj.syncMode,
      obj.lastSuccessfulSync,
      obj.syncIntervalInMn,
      obj.lastSyncStatus,
      obj.currentSyncStatus,
      obj.databaseName,
      obj.tableName,
      obj.maxFetchSize,
      obj.incrementalColumn ?? void 0,
      obj.lastSyncedValue ?? void 0
    );
  }

  static default(dataSource: DataSourceInfo) {
    return new JdbcJob(Job.DEFAULT_ID, '', dataSource.id, SyncMode.FullSync, 0, 60, JobStatus.Initialized, JobStatus.Initialized, '', '', 0, void 0, '0');
  }

  resetIncrementalColumn() {
    this.incrementalColumn = void 0;
  }

  resetLastSyncedValue() {
    this.lastSyncedValue = '0';
  }

  displayCurrentStatus(): HTMLElement {
    const color = Job.getColorFromStatus(this.currentSyncStatus);
    if (this.currentSyncStatus === JobStatus.Error || this.currentSyncStatus === JobStatus.Synced) {
      const syncTime = Math.ceil((this.lastSuccessfulSync + this.syncIntervalInMn * 60000 - Date.now()) / 60000);
      return HtmlElementRenderUtils.buildTextColor(`next sync in ${syncTime} minutes`, '#fff');
    } else {
      return HtmlElementRenderUtils.buildTextColor(this.currentSyncStatus, color);
    }
  }
}
