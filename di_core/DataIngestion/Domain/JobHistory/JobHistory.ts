/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:54 PM
 */

import { JobStatus } from '@core/DataIngestion';
import { JobId, SyncId } from '@core/domain';

export class JobHistory {
  syncId: SyncId;
  jobId: JobId;
  lastSyncTime: number;
  totalSyncedTime: number;
  syncStatus: JobStatus;
  message: string;
  totalRowsInserted: number;

  constructor(syncId: SyncId, jobId: JobId, lastSyncTime: number, totalSyncedTime: number, syncStatus: JobStatus, message: string, totalRowsInserted: number) {
    this.syncId = syncId;
    this.jobId = jobId;
    this.lastSyncTime = lastSyncTime;
    this.totalSyncedTime = totalSyncedTime;
    this.syncStatus = syncStatus;
    this.message = message;
    this.totalRowsInserted = totalRowsInserted;
  }

  static fromObject(obj: JobHistory & any): JobHistory {
    return new JobHistory(obj.syncId, obj.jobId, obj.lastSyncTime, obj.totalSyncedTime, obj.syncStatus, obj.message, obj.totalRowsInserted);
  }
}
