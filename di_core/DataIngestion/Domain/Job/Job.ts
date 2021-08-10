/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:35 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:03 PM
 */

import { DataSourceInfo } from '@core/DataIngestion/Domain/DataSource/DataSourceInfo';
import { JobStatus } from '@core/DataIngestion/Domain/Job/JobStatus';
import { JobType } from '@core/DataIngestion/Domain/Job/JobType';
import { JdbcJob } from '@core/DataIngestion/Domain/Job/JdbcJob';
import { FormMode } from '@core/DataIngestion/Domain/Job/FormMode';
import { DIException, JobId, SourceId } from '@core/domain';
import { DataSourceType } from '@core/DataIngestion';
import { JobName } from '@core/DataIngestion/Domain/Job/JobName';
import { UnsupportedException } from '@core/domain/Exception/UnsupportedException';

export abstract class Job {
  static DEFAULT_ID = -1;
  abstract className: JobName;
  abstract jobId: JobId;
  abstract displayName: string;
  abstract sourceId: SourceId;
  abstract jobType: JobType;
  abstract syncIntervalInMn: number;
  abstract lastSuccessfulSync: number;
  abstract lastSyncStatus: JobStatus;
  abstract currentSyncStatus: JobStatus;

  abstract displayCurrentStatus(): HTMLElement;

  static fromObject(obj: any): Job {
    switch (obj.jobType) {
      case JobType.Jdbc:
        return JdbcJob.fromObject(obj);
      default:
        throw new UnsupportedException(`unSupported job type ${obj.jobType}`);
    }
  }

  static default(dataSource: DataSourceInfo) {
    switch (dataSource.sourceType) {
      case DataSourceType.MSSql:
      case DataSourceType.MySql:
      case DataSourceType.Oracle:
      case DataSourceType.Redshift:
      case DataSourceType.BigQuery:
      case DataSourceType.PostgreSql:
        return JdbcJob.default(dataSource);
    }
  }

  static getJobFormConfigMode(job: Job) {
    switch (job.jobId) {
      case Job.DEFAULT_ID:
        return FormMode.Create;
      default:
        return FormMode.Edit;
    }
  }

  static getColorFromStatus(status: JobStatus): string {
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
}

export class JobInfo {
  job: Job;
  source: DataSourceInfo;

  constructor(job: Job, source: DataSourceInfo) {
    this.job = job;
    this.source = source;
  }

  static fromObject(obj: any & JobInfo): JobInfo {
    const job: Job = Job.fromObject(obj.job);
    const source: DataSourceInfo = DataSourceInfo.fromDataSource(obj.source);
    return new JobInfo(job, source);
  }
}
