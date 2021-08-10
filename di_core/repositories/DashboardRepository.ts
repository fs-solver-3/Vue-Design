import { Dashboard, DashboardId, DashboardSetting, DIMap, MainDateFilter, Position, Widget, WidgetId } from '@core/domain/Model';
import { CreateDashboardRequest } from '@core/domain/Request';
import { BaseClient } from '@core/services/base.service';
import { InjectValue } from 'typescript-ioc';
import { DIKeys } from '@core/modules/di';
import { PermissionTokenResponse } from '@core/domain/Response';
import { Log } from '@core/utils';

export abstract class DashboardRepository {
  abstract get(id: DashboardId): Promise<Dashboard>;

  abstract create(request: CreateDashboardRequest): Promise<Dashboard>;

  abstract rename(id: DashboardId, toName: string): Promise<boolean>;

  abstract delete(id: DashboardId): Promise<boolean>;

  abstract getWidget(id: DashboardId, widgetId: WidgetId): Promise<Widget>;

  abstract createWidget(dashboardId: DashboardId, widget: Widget, position: Position): Promise<Widget>;

  abstract editWidget(dashboardId: DashboardId, widgetId: WidgetId, widget: Widget): Promise<boolean>;

  abstract resizeWidgets(dashboardId: DashboardId, positions: DIMap<Position>): Promise<boolean>;

  abstract deleteWidget(dashboardId: DashboardId, widgetId: WidgetId): Promise<boolean>;

  abstract editMainDateFilter(dashboardId: DashboardId, mainDateFilter: MainDateFilter): Promise<boolean>;

  abstract share(dashboardId: DashboardId): Promise<PermissionTokenResponse>;

  abstract editSetting(dashboardId: DashboardId, setting: DashboardSetting): Promise<DashboardSetting>;
}

export class DashboardRepositoryImpl extends DashboardRepository {
  @InjectValue(DIKeys.authClient)
  private httpClient!: BaseClient;
  private apiPath = '/dashboards';
  private apiChartPath = '/chart';

  get(id: DashboardId): Promise<Dashboard> {
    return this.httpClient.get<Dashboard>(`${this.apiPath}/${id}`).then(item => Dashboard.fromObject(item));
  }

  create(request: CreateDashboardRequest): Promise<Dashboard> {
    return this.httpClient.post<Dashboard>(`${this.apiPath}/create`, request).then(item => Dashboard.fromObject(item));
  }

  rename(id: DashboardId, toName: string): Promise<boolean> {
    return this.httpClient
      .put(`${this.apiPath}/${id}/rename`, {
        toName: toName
      })
      .then(_ => true);
  }

  delete(id: DashboardId): Promise<boolean> {
    return this.httpClient.delete(`${this.apiPath}/${id}`).then(_ => true);
  }

  getWidget(id: DashboardId, widgetId: WidgetId): Promise<Widget> {
    return this.httpClient.get(`${this.apiPath}/${id}/widgets/${widgetId}`).then(item => Widget.fromObject(item));
  }

  createWidget(dashboardId: DashboardId, widget: Widget, position: Position): Promise<Widget> {
    Log.debug('createWidget', widget);
    return this.httpClient
      .post<Widget>(`${this.apiPath}/${dashboardId}/widgets/create`, {
        widget: widget,
        position: position
      })
      .then(item => Widget.fromObject(item));
  }

  editWidget(dashboardId: DashboardId, widgetId: WidgetId, widget: Widget): Promise<boolean> {
    return this.httpClient
      .put(`${this.apiPath}/${dashboardId}/widgets/${widgetId}/edit`, {
        dashboardId: dashboardId,
        widgetId: widgetId,
        widget: widget
      })
      .then(_ => true);
  }

  resizeWidgets(dashboardId: DashboardId, positions: DIMap<Position>): Promise<boolean> {
    return this.httpClient
      .put(`${this.apiPath}/${dashboardId}/widgets/resize`, {
        positions: positions
      })
      .then(_ => true);
  }

  deleteWidget(dashboardId: DashboardId, widgetId: WidgetId): Promise<boolean> {
    return this.httpClient.delete(`${this.apiPath}/${dashboardId}/widgets/${widgetId}`).then(_ => true);
  }

  editMainDateFilter(dashboardId: DashboardId, mainDateFilter: MainDateFilter): Promise<boolean> {
    return this.httpClient.put(`${this.apiPath}/${dashboardId}/main_date_filter/edit`, { mainDateFilter: mainDateFilter }).then(_ => true);
  }

  share(dashboardId: DashboardId): Promise<PermissionTokenResponse> {
    return this.httpClient.post<PermissionTokenResponse>(`${this.apiPath}/${dashboardId}/share`, { actions: ['view'] });
  }

  editSetting(dashboardId: DashboardId, setting: DashboardSetting): Promise<DashboardSetting> {
    return this.httpClient
      .put(`${this.apiPath}/${dashboardId}`, {
        setting: setting
      })
      .then(_ => setting);
  }
}
