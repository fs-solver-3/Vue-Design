import { JobFormRender } from '@/screens/DataIngestion/FormBuilder/JobFormRender';
import { Job } from '@core/DataIngestion/Domain/Job/Job';
import { BFormCheckbox, BFormInput, BFormRadio, BFormRadioGroup } from 'bootstrap-vue';
import '@/screens/DataIngestion/components/DataSourceConfigForm/scss/job_form.scss';
import { JdbcJob, SyncMode } from '@core/DataIngestion/Domain/Job/JdbcJob';
import { TableSuggestionCommand } from '@/screens/DataIngestion/interfaces/TableSuggestionCommand';
import DynamicSuggestionInput from '@/screens/DataIngestion/components/DynamicSuggestionInput.vue';
import { DatabaseSuggestionCommand } from '@/screens/DataIngestion/interfaces/DatabaseSuggestionCommand';
import { IncrementalColumnSuggestionCommand } from '@/screens/DataIngestion/interfaces/IncrementalColumnSuggestionCommand';

export class RedshiftJobFormRender implements JobFormRender {
  private jdbcJob: JdbcJob;

  constructor(jdbcJob: JdbcJob) {
    this.jdbcJob = jdbcJob;
  }

  createJob(): Job {
    switch (this.syncMode) {
      case SyncMode.FullSync: {
        this.jdbcJob.resetIncrementalColumn();
        this.jdbcJob.resetLastSyncedValue();
        break;
      }
    }
    return this.jdbcJob;
  }

  private get displayName() {
    return this.jdbcJob.displayName;
  }

  private set displayName(value: string) {
    this.jdbcJob.displayName = value;
  }

  private get syncMode(): SyncMode {
    return this.jdbcJob.syncMode;
  }

  private set syncMode(syncMode: SyncMode) {
    this.jdbcJob.syncMode = syncMode;
  }

  private get databaseName(): string {
    return this.jdbcJob.databaseName;
  }

  private set databaseName(value: string) {
    this.jdbcJob.databaseName = value;
    this.jdbcJob.destDatabase = value;
  }

  private get tableName(): string {
    return this.jdbcJob.tableName;
  }

  private set tableName(value: string) {
    this.jdbcJob.tableName = value;
    this.jdbcJob.destTable = value;
  }

  private get incrementalColumn(): string | undefined {
    return this.jdbcJob.incrementalColumn;
  }

  private set incrementalColumn(value: string | undefined) {
    this.jdbcJob.incrementalColumn = value;
  }

  private get startValue(): string | undefined {
    return this.jdbcJob.lastSyncedValue;
  }

  private set startValue(value: string | undefined) {
    this.jdbcJob.lastSyncedValue = value;
  }

  private get syncIntervalInMn(): number {
    return this.jdbcJob.syncIntervalInMn;
  }

  private set syncIntervalInMn(value: number) {
    this.jdbcJob.syncIntervalInMn = value;
  }

  render(h: any): any {
    return (
      <div>
        <div class="job-form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Job name:</div>
          <div class="input">
            <BFormInput placeholder="Input job name" autocomplete="off" v-model={this.displayName}></BFormInput>
          </div>
        </div>
        <div class="job-form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Schema name:</div>
          <div class="input">
            <DynamicSuggestionInput
              {...{
                props: {
                  suggestionCommand: new DatabaseSuggestionCommand(this.jdbcJob.sourceId),
                  value: this.databaseName,
                  placeholder: 'Input database name'
                }
              }}
              onChange={(value: string) => {
                this.databaseName = value;
              }}
            />
          </div>
        </div>
        <div class="job-form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Table name:</div>
          <div class="input">
            <DynamicSuggestionInput
              {...{
                props: {
                  suggestionCommand: new TableSuggestionCommand(this.jdbcJob.sourceId, this.databaseName),
                  value: this.tableName,
                  placeholder: 'Input table name'
                }
              }}
              onChange={(value: string) => {
                this.tableName = value;
              }}
            />
          </div>
        </div>
        <div class="job-form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Sync mode:</div>
          <div class="input align-content-center">
            <BFormRadioGroup id="radio-group-2" v-model={this.syncMode} name="radio-sub-component">
              <BFormRadio value={SyncMode.FullSync}>Full sync</BFormRadio>
              <BFormRadio value={SyncMode.IncrementalSync}>Incremental sync</BFormRadio>
            </BFormRadioGroup>
          </div>
        </div>
        {this.syncMode === SyncMode.FullSync && (
          <div class="job-form-item d-flex flex-column">
            <div class="job-form-item d-flex w-100 justify-content-center align-items-center">
              <div class="title">Sync interval(minutes):</div>
              <div class="input">
                <BFormInput placeholder="Input sync interval in minutes" autocomplete="off" v-model={this.syncIntervalInMn}></BFormInput>
              </div>
            </div>
            <div style={'height: 82px'}></div>
          </div>
        )}
        {this.syncMode === SyncMode.IncrementalSync && (
          <div class="job-form-item d-flex flex-column">
            <div class="job-form-item d-flex w-100 justify-content-center align-items-center">
              <div class="title">Incremental column:</div>
              <div class="input">
                <DynamicSuggestionInput
                  {...{
                    props: {
                      suggestionCommand: new IncrementalColumnSuggestionCommand(this.jdbcJob.sourceId, this.databaseName, this.tableName),
                      value: this.incrementalColumn,
                      placeholder: 'Input incremental column'
                    }
                  }}
                  onChange={(value: string) => {
                    this.incrementalColumn = value;
                  }}
                />
              </div>
            </div>
            <div class="job-form-item d-flex w-100 justify-content-center align-items-center">
              <div class="title">Start value:</div>
              <div class="input">
                <BFormInput placeholder="Input start value" autocomplete="off" v-model={this.startValue}></BFormInput>
              </div>
            </div>
            <div class="job-form-item d-flex flex-column">
              <div class="job-form-item d-flex w-100 justify-content-center align-items-center">
                <div class="title">Sync interval(minutes):</div>
                <div class="input">
                  <BFormInput placeholder="Input sync interval in minutes" autocomplete="off" v-model={this.syncIntervalInMn}></BFormInput>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
