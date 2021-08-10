import { DashboardRepository } from '@core/repositories';
import { Inject } from 'typescript-ioc';
import { CreateDashboardRequest } from '@core/domain/Request';
import { PermissionTokenResponse } from '@core/domain/Response';
import { Dashboard, DashboardId, DashboardSetting, DIMap, MainDateFilter, Position, Widget, WidgetId } from '@core/domain/Model';

export abstract class DashboardService {
  abstract get(id: DashboardId): Promise<Dashboard>;

  abstract create(request: CreateDashboardRequest): Promise<Dashboard>;

  abstract rename(id: DashboardId, toName: string): Promise<boolean>;

  abstract delete(id: DashboardId): Promise<boolean>;

  abstract getWidget(dashboardId: DashboardId, widgetId: WidgetId): Promise<Widget>;

  abstract createWidget(dashboardId: DashboardId, widget: Widget, position: Position): Promise<Widget>;

  abstract editWidget(dashboardId: DashboardId, widgetId: WidgetId, widget: Widget): Promise<boolean>;

  abstract resizeWidgets(dashboardId: DashboardId, positions: DIMap<Position>): Promise<boolean>;

  abstract deleteWidget(dashboardId: DashboardId, widgetId: WidgetId): Promise<boolean>;

  abstract editMainDateFilter(dashboardId: DashboardId, mainDateFilter: MainDateFilter): Promise<boolean>;

  abstract share(dashboardId: DashboardId): Promise<PermissionTokenResponse>;

  abstract editSetting(dashboardId: DashboardId, setting: DashboardSetting): Promise<DashboardSetting>;
}

export class DashboardServiceImpl extends DashboardService {
  constructor(@Inject private dashboardRepository: DashboardRepository) {
    super();
  }

  get(id: DashboardId): Promise<Dashboard> {
    return this.dashboardRepository.get(id);
  }

  create(request: CreateDashboardRequest): Promise<Dashboard> {
    return this.dashboardRepository.create(request);
  }

  delete(id: DashboardId): Promise<boolean> {
    return this.dashboardRepository.delete(id);
  }

  rename(id: DashboardId, toName: string): Promise<boolean> {
    return this.dashboardRepository.rename(id, toName);
  }

  getWidget(id: DashboardId, widgetId: WidgetId): Promise<Widget> {
    return this.dashboardRepository.getWidget(id, widgetId);
  }

  createWidget(dashboardId: DashboardId, widget: Widget, position: Position): Promise<Widget> {
    return this.dashboardRepository.createWidget(dashboardId, widget, position);
  }

  editWidget(dashboardId: DashboardId, widgetId: WidgetId, widget: Widget): Promise<boolean> {
    return this.dashboardRepository.editWidget(dashboardId, widgetId, widget);
  }

  resizeWidgets(dashboardId: DashboardId, positions: DIMap<Position>): Promise<boolean> {
    return this.dashboardRepository.resizeWidgets(dashboardId, positions);
  }

  deleteWidget(dashboardId: DashboardId, widgetId: WidgetId): Promise<boolean> {
    return this.dashboardRepository.deleteWidget(dashboardId, widgetId);
  }

  editMainDateFilter(dashboardId: DashboardId, mainDateFilter: MainDateFilter): Promise<boolean> {
    return this.dashboardRepository.editMainDateFilter(dashboardId, mainDateFilter);
  }

  share(dashboardId: DashboardId): Promise<PermissionTokenResponse> {
    return this.dashboardRepository.share(dashboardId);
  }

  editSetting(dashboardId: DashboardId, setting: DashboardSetting): Promise<DashboardSetting> {
    return this.dashboardRepository.editSetting(dashboardId, setting);
  }
}
