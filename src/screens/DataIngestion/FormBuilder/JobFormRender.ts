import { Job } from '@core/DataIngestion/Domain/Job/Job';
import { JdbcJob } from '@core/DataIngestion';
import { JdbcJobFormRender } from '@/screens/DataIngestion/FormBuilder/RenderImpl/JdbcJobFormRender';

export abstract class JobFormRender {
  abstract createJob(): Job;
  abstract render(h: any): any;

  static default(): JobFormRender {
    const jdbcJob = JdbcJob.fromObject({});
    return new JdbcJobFormRender(jdbcJob);
  }
}
