/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 2:05 PM
 */

import { BaseModule } from '@core/modules';
import { Container, Scope } from 'typescript-ioc';
import { DataSourceRepository, DataSourceRepositoryImpl } from '@core/DataIngestion/Repository/DataSourceRepository';
import { JobService, JobServiceImpl } from '@core/DataIngestion/Service/JobService';
import { JobRepository, JobRepositoryImpl } from '@core/DataIngestion/Repository/JobRepository';
import { JobHistoryRepository, JobHistoryRepositoryImpl, JobHistoryService, JobHistoryServiceImpl } from '@core/DataIngestion';
import { DataSourceService, DataSourceServiceImpl } from '@core/services/DataSourceService';

export class DataIngestionModule extends BaseModule {
  configuration() {
    this.bindDataSourceModule();
    this.bindJobModule();
    this.bindJobHistoryModule();
  }

  private bindDataSourceModule() {
    Container.bind(DataSourceService)
      .to(DataSourceServiceImpl)
      .scope(Scope.Singleton);
    Container.bind(DataSourceRepository)
      .to(DataSourceRepositoryImpl)
      .scope(Scope.Singleton);
  }

  private bindJobModule() {
    Container.bind(JobService)
      .to(JobServiceImpl)
      .scope(Scope.Singleton);
    Container.bind(JobRepository)
      .to(JobRepositoryImpl)
      .scope(Scope.Singleton);
  }

  private bindJobHistoryModule() {
    Container.bind(JobHistoryRepository)
      .to(JobHistoryRepositoryImpl)
      .scope(Scope.Singleton);
    Container.bind(JobHistoryService)
      .to(JobHistoryServiceImpl)
      .scope(Scope.Singleton);
  }
}
