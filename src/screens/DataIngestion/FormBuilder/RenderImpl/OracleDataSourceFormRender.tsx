import '@/screens/DataIngestion/components/DataSourceConfigForm/scss/form.scss';
import { BFormInput } from 'bootstrap-vue';
import { DataSourceFormRender } from '@/screens/DataIngestion/FormBuilder/DataSourceFormRender';
import { OracleSourceInfo } from '@core/DataIngestion/Domain/DataSource/OracleSourceInfo';
import { DataSourceInfo } from '@core/DataIngestion/Domain/DataSource/DataSourceInfo';

export class OracleDataSourceFormRender implements DataSourceFormRender {
  private oracleSourceInfo: OracleSourceInfo;

  constructor(oracleSourceInfo: OracleSourceInfo) {
    this.oracleSourceInfo = oracleSourceInfo;
  }

  private get displayName() {
    return this.oracleSourceInfo.displayName;
  }

  private set displayName(value: string) {
    this.oracleSourceInfo.displayName = value;
  }

  private get host() {
    return this.oracleSourceInfo.host;
  }

  private set host(value: string) {
    this.oracleSourceInfo.host = value;
  }

  private get port() {
    return this.oracleSourceInfo.port;
  }

  private set port(value: string) {
    this.oracleSourceInfo.port = value;
  }

  private get username() {
    return this.oracleSourceInfo.username;
  }

  private set username(value: string) {
    this.oracleSourceInfo.username = value;
  }
  private get password() {
    return this.oracleSourceInfo.password;
  }

  private set password(value: string) {
    this.oracleSourceInfo.password = value;
  }
  private get serviceName() {
    return this.oracleSourceInfo.serviceName;
  }

  private set serviceName(value: string) {
    this.oracleSourceInfo.serviceName = value;
  }

  renderForm(h: any): any {
    return (
      <div>
        <div class="form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Display name:</div>
          <div class="input">
            <BFormInput placeholder="Input display name" autocomplete="off" v-model={this.displayName}></BFormInput>
          </div>
        </div>
        <div class="form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Host:</div>
          <div class="input">
            <BFormInput placeholder="Input host" autocomplete="off" trim v-model={this.host}></BFormInput>
          </div>
        </div>
        <div class="form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Port:</div>
          <div class="input">
            <BFormInput placeholder={'Input port'} autocomplete="off" trim v-model={this.port}></BFormInput>
          </div>
        </div>
        <div class="form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Service Name:</div>
          <div class="input">
            <BFormInput placeholder="Input service name" autocomplete="off" trim v-model={this.serviceName}></BFormInput>
          </div>
        </div>

        <div class="form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Username:</div>
          <div class="input">
            <BFormInput placeholder="Input username" autocomplete="off" trim v-model={this.username}></BFormInput>
          </div>
        </div>
        <div class="form-item d-flex w-100 justify-content-center align-items-center">
          <div class="title">Password:</div>
          <div class="input">
            <BFormInput v-model={this.password} placeholder="Input password" type="password"></BFormInput>
          </div>
        </div>
      </div>
    );
  }

  createDataSourceInfo(): DataSourceInfo {
    return OracleSourceInfo.fromObject(this.oracleSourceInfo);
  }
}
