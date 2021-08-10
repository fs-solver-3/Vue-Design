/*
 * @author: tvc12 - Thien Vi
 * @created: 5/25/21, 5:00 PM
 */

import { Vue } from 'vue-property-decorator';
import { Inject } from 'typescript-ioc';
import { QueryRequest } from '@core/domain/Request';
import { DashboardId, DIMap, Field } from '@core/domain/Model';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { DIException } from '@core/domain/Exception';
import { DateRange, Status, Stores } from '@/shared';
import { QueryService } from '@core/services';
import { VisualizationResponse } from '@core/domain/Response';

export interface MainDateCompareRequest {
  field: Field;
  currentRange: DateRange | null;
  compareRange: DateRange | null;
}

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.dataStore })
export class DataStore extends VuexModule {
  readonly PREVIEW_WIDGET_ID = -1;
  chartDataResponses: DIMap<VisualizationResponse> = {};
  statuses: DIMap<Status> = {};
  mapErrorMessage: DIMap<string> = {};
  private dashboardId: DashboardId = -1;

  @Inject
  private queryService!: QueryService;

  get previewResponse(): VisualizationResponse | undefined {
    return this.chartDataResponses[this.PREVIEW_WIDGET_ID];
  }

  @Action
  async renderChart(payload: { request: QueryRequest; forceFetch: boolean; chartId: number }): Promise<void> {
    const dashboardId = this.dashboardId;
    const { chartId, forceFetch, request } = payload;
    if (dashboardId) {
      if (forceFetch) {
        return this.fetchWidget({ id: chartId, request: request });
      } else {
        return this.updateWidget({ id: chartId, request: request });
      }
    } else {
      this.setStatusError({ id: chartId, message: "Can't get chart" });
      return Promise.reject(new DIException("Can't get chart"));
    }
  }

  @Action
  query(request: QueryRequest): Promise<VisualizationResponse> {
    return this.queryService.query(request);
  }

  @Mutation
  addData(payload: { id: number; data: VisualizationResponse }) {
    const { id, data } = payload;
    Vue.set(this.chartDataResponses, id, data);
    Vue.set(this.mapErrorMessage, id, '');
  }

  @Action
  private async fetchWidget(payload: { id: number; request: QueryRequest }): Promise<void> {
    const { id, request } = payload;
    try {
      this.setStatusLoading(id);
      const response = await this.query(request);
      this.addData({ id: id, data: response });
      this.setStatusLoaded(id);
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      this.setStatusError({ id: id, message: exception.message });
    }
  }

  @Action
  private async updateWidget(payload: { id: number; request: QueryRequest }): Promise<void> {
    const { id, request } = payload;
    try {
      this.setStatusUpdating(id);
      const response = await this.query(request);
      this.addData({ id: id, data: response });
      this.setStatusLoaded(id);
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      this.setStatusError({ id: id, message: exception.message });
    }
  }

  @Mutation
  reset() {
    this.chartDataResponses = {};
    this.statuses = {};
    this.mapErrorMessage = {};
    this.dashboardId = -1;
  }

  @Mutation
  setDashboardId(dashboardId: number) {
    this.dashboardId = dashboardId;
  }

  @Mutation
  setStatusError(payload: { id: number; message: string }) {
    const { id, message } = payload;
    Vue.set(this.statuses, id, Status.Error);
    Vue.set(this.mapErrorMessage, id, message);
  }

  @Mutation
  setStatusLoading(chartId: number) {
    Vue.set(this.statuses, chartId, Status.Loading);
  }

  @Mutation
  setStatusLoaded(chartId: number) {
    Vue.set(this.statuses, chartId, Status.Loaded);
  }

  @Mutation
  setStatusRendering(chartId: number) {
    Vue.set(this.statuses, chartId, Status.Rendering);
  }

  @Mutation
  setStatusRendered(chartId: number) {
    Vue.set(this.statuses, chartId, Status.Rendered);
  }

  @Mutation
  setStatusUpdating(chartId: number) {
    Vue.set(this.statuses, chartId, Status.Updating);
  }

  @Mutation
  refresh(chartId: number) {
    if (Status.Loaded) {
      Vue.set(this.statuses, chartId, Status.Updating);
      Vue.set(this.statuses, chartId, Status.Loaded);
    }
  }
}

export const DataModule = getModule(DataStore);
