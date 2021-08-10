import { JobInfo } from '@core/DataIngestion/Domain/Job/Job';
import { JobFormRender } from '@/screens/DataIngestion/FormBuilder/JobFormRender';
import { JdbcJobFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/JdbcJobFormRender';
import { JdbcJob } from '@core/DataIngestion/Domain/Job/JdbcJob';
import { DataSourceType } from '@core/DataIngestion';
import { MsSqlJobFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/MsSqlJobFormRender';
import { RedshiftJobFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/RedshiftJobFormRender';
import { UnsupportedException } from '@core/domain/Exception/UnsupportedException';
import { PostgreSqlJobFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/PostgreSqlJobFormRender';

export class JobFormFactory {
  createRender(jobInfo: JobInfo): JobFormRender {
    switch (jobInfo.source.sourceType) {
      case DataSourceType.MySql:
      case DataSourceType.Oracle:
      case DataSourceType.BigQuery: {
        return new JdbcJobFormRender(jobInfo.job as JdbcJob);
      } //todo: fix here
      case DataSourceType.MSSql:
        return new MsSqlJobFormRender(jobInfo.job as JdbcJob);
      case DataSourceType.Redshift:
        return new RedshiftJobFormRender(jobInfo.job as JdbcJob);
      case DataSourceType.PostgreSql:
        return new PostgreSqlJobFormRender(jobInfo.job as JdbcJob);
      default:
        throw new UnsupportedException(`Unsupported job type ${jobInfo.source.sourceType}`);
    }
  }
}
