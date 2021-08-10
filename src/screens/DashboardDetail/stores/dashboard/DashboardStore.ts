/*
 * @author: tvc12 - Thien Vi
 * @created: 5/25/21, 4:57 PM
 */

import {
  Dashboard,
  DashboardId,
  DashboardSetting,
  DIException,
  DIMap,
  ImageWidget,
  MainDateFilter,
  MainDateFilterMode,
  Position,
  QueryRelatedWidget,
  Widget
} from '@core/domain';
import { ApiExceptions, DateRange, Status, Stores } from '@/shared';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { ListUtils, PositionUtils } from '@/utils';
import { DashboardService, DataManager, UploadService } from '@core/services';
import { Inject } from 'typescript-ioc';
import { Route } from 'vue-router';
import { DashboardControllerModule, FilterModule, QuerySettingModule, WidgetModule } from '@/screens/DashboardDetail/stores';
import { TrackingService } from '@core/tracking/service/tracking.service';
import { Properties } from '@datainsider/di-web-analytics/dist/domain';
import router from '@/router/router';
import { Routers } from '@/shared/enums/routers.enum';
import { Log, WidgetUtils } from '@core/utils';
import { ZoomModule } from '@/store/modules/zoom.store';
import { DashboardAction } from '@core/tracking/domain/tracking_data';
import { ThemeModule } from '@/store/modules/theme.store';
import { DI } from '@core/modules';
import { DashboardThemeType } from '@core/domain/Model/Dashboard/Setting/DashboardThemeType';

export interface MainDateData {
  mode: MainDateFilterMode;
  chosenDateRange?: DateRange | null;
}

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.dashboardStore })
export class DashboardStore extends VuexModule {
  previousPage: Route | null = null;
  dashboardTitle = 'Untitled';
  dashboardStatus: Status = Status.Loading;
  errorMessage = '';
  mainDateFilter: MainDateFilter | null = null;
  mainDateFilterMode: MainDateFilterMode = MainDateFilterMode.allTime;
  myDataPage: Route | null = null;
  ownerId: string | null = null;
  setting: DashboardSetting = DashboardSetting.default();
  private dashboardId?: DashboardId = void 0;
  // TODO: avoid undefine
  private widgetWillAddToDashboard: Widget | null = null;
  private widgetWillUpdate: Widget | null = null;
  @Inject
  private dashboardService!: DashboardService;

  @Inject
  private uploadService!: UploadService;

  @Inject
  private trackingService!: TrackingService;

  @Inject
  private dataManager!: DataManager;

  get title() {
    return this.dashboardTitle || 'Untitled';
  }

  get id() {
    return this.dashboardId;
  }

  get positions(): DIMap<Position> {
    return WidgetModule.mapPosition || {};
  }

  get widgetAsMap(): DIMap<Widget> {
    return WidgetModule.widgetAsMap;
  }

  get hasWidget(): boolean {
    return ListUtils.isNotEmpty(WidgetModule.widgets);
  }

  get databaseNames(): string[] {
    if (ListUtils.isEmpty(WidgetModule.allQueryWidgets)) {
      return [];
    } else {
      return WidgetUtils.getDatabaseNamesFromQueryRelatedWidget(WidgetModule.allQueryWidgets);
    }
  }

  get databaseUniqueNames(): string[] {
    if (ListUtils.isEmpty(this.databaseNames)) {
      return [];
    } else {
      return Array.from(new Set(this.databaseNames).values());
    }
  }

  get databaseHighestUsed(): string | null {
    return WidgetUtils.getMainDatabase(WidgetModule.allQueryWidgets);
  }

  get isOwner(): boolean {
    const userInfo = this.dataManager.getUserInfo();
    if (userInfo && this.ownerId) {
      return userInfo.username == this.ownerId;
    } else {
      return false;
    }
  }

  @Action
  handleError(ex: DIException) {
    switch (ex.reason) {
      case ApiExceptions.unauthorized:
        this.showError("You don't have permission to view dashboard");
        break;
      case ApiExceptions.notFound:
        return router.replace({ name: Routers.mydata });
      default:
        this.showError('Load dashboard error!');
    }
  }

  @Action({ rawError: true })
  async handleLoadDashboard(id: DashboardId): Promise<void> {
    try {
      this.setDashboardId(id);
      this.setDashboardStatus(Status.Loading);
      const dashboard = await this.dashboardService.get(id);
      this.saveOwnerId({ ownerId: dashboard.ownerId });
      await this.processDashboardData(dashboard);
    } catch (ex) {
      this.trackingService.trackDashboard({
        action: DashboardAction.View,
        dashboardId: id,
        isError: true
      });
      await this.handleError(ex);
    }
  }

  @Mutation
  saveOwnerId(payload: { ownerId: string }) {
    this.ownerId = payload.ownerId;
  }

  @Action
  async handleEditMainDateFilter(newMainDateFilter: MainDateFilter): Promise<void> {
    if (this.id) {
      await this.dashboardService.editMainDateFilter(this.id, newMainDateFilter);
    } else {
      this.showError(`dashboard.store.ts::handleUploadMainDateFilter::dashboardId::${this.id}`);
    }
  }

  @Action
  handleUpdateImage(file: File): Promise<ImageWidget> {
    //TODO: show loading when uploading
    return this.uploadService
      .upload(file)
      .then(response => ImageWidget.fromUrl(response.data))
      .catch(ex => {
        Log.error('uploadImage::', ex);
        return ex;
      });
  }

  @Action
  async handleUpdateOrAddNewWidgetFromChartBuilder() {
    await this.handleUpdateWidgetFromChartBuilder();
    await this.handleAddWidgetToDashboard();
  }

  @Action({ rawError: true })
  async handleRenameDashboard(newName: string): Promise<void> {
    if (this.id) {
      try {
        const result: boolean = await this.dashboardService.rename(this.id, newName);
        if (result) {
          this.setDashboardTitle(newName);
          this.trackingService.trackDashboard({
            action: DashboardAction.Rename,
            dashboardId: this.id || 0,
            dashboardName: this.dashboardTitle,
            isError: false,
            extraProperties: { dashboardNewName: newName } as Properties
          });
        } else {
          throw new DIException('Rename failure, try again');
        }
      } catch (ex) {
        this.trackingService.trackDashboard({
          action: DashboardAction.Rename,
          dashboardId: this.id || 0,
          dashboardName: this.dashboardTitle,
          isError: true,
          extraProperties: { dashboardNewName: newName } as Properties
        });
        return Promise.reject(ex);
      }
    } else {
      return Promise.reject(new DIException('Can not rename this dashboard'));
    }
  }

  @Mutation
  showError(errorMessage: string) {
    Log.debug('errorMessage::', errorMessage);
    this.dashboardStatus = Status.Error;
    this.errorMessage = errorMessage;
  }

  @Mutation
  setDashboardTitle(title: string) {
    this.dashboardTitle = title;
  }

  @Mutation
  setPreviousPage(payload: Route) {
    this.previousPage = payload;
  }

  @Mutation
  setMyDataPage(payload: Route) {
    this.myDataPage = payload;
  }

  @Mutation
  setMainDateFilter(mainDateFilter: MainDateFilter) {
    this.mainDateFilter = mainDateFilter;
  }

  @Mutation
  setMainDateFilterMode(mode: MainDateFilterMode) {
    this.mainDateFilterMode = mode;
  }

  @Mutation
  reset() {
    this.dashboardStatus = Status.Loading;
    this.dashboardTitle = 'Untitled';
    this.errorMessage = '';
    this.mainDateFilter = null;
    this.mainDateFilterMode = MainDateFilterMode.allTime;
    this.ownerId = null;
    this.setting = DashboardSetting.default();
  }

  @Mutation
  setWidgetWillAddToDashboard(widget: Widget | null) {
    this.widgetWillAddToDashboard = widget;
  }

  @Mutation
  setWidgetWillUpdate(widget: Widget | null) {
    this.widgetWillUpdate = widget;
  }

  @Mutation
  setDashboardStatus(status: Status) {
    this.dashboardStatus = status;
  }

  @Action
  saveMainDateFilterMode(payload: MainDateData) {
    if (this.id) {
      this.dataManager.saveMainDateFilterMode(this.id, payload);
    }
  }

  @Mutation
  setDashboardSetting(setting: DashboardSetting) {
    this.setting = setting;
    ThemeModule.setDashboardTheme(setting.themeName);
  }

  @Mutation
  loadThemeFromLocal(id: DashboardId): void {
    const setting = DI.get(DataManager).getDashboardSetting(id);
    const themeName = setting?.themeName ?? DashboardThemeType.default;
    ThemeModule.setDashboardTheme(themeName);
  }

  @Action
  private async processDashboardData(dashboard: Dashboard): Promise<void> {
    this.setDashboardTitle(dashboard.name);
    this.setDashboardSetting(dashboard.setting);
    DI.get(DataManager).saveDashboardSetting(dashboard.id, dashboard.setting);
    await this.loadMainDateFilterMode(dashboard);
    FilterModule.loadLocalMainFilters(dashboard);
    WidgetModule.setWidgets(dashboard.widgets || []);
    WidgetModule.setMapPosition(dashboard.widgetPositions || []);
    QuerySettingModule.saveQuerySetting(WidgetModule.allQueryWidgets);
    DashboardControllerModule.initAffectFilterWidgets(WidgetModule.allQueryWidgets);
    ZoomModule.loadZoomLevels(WidgetModule.allQueryWidgets);
    ZoomModule.registerMultiZoomData(WidgetModule.allQueryWidgets);
    this.trackingService.trackDashboard({
      action: DashboardAction.View,
      dashboardId: dashboard.id,
      dashboardName: dashboard.name
    });
    this.setDashboardStatus(Status.Loaded);
  }

  @Action
  private async handleUpdateWidgetFromChartBuilder(): Promise<void> {
    if (this.widgetWillUpdate) {
      const success = await WidgetModule.handleUpdateWidget(this.widgetWillUpdate);
      if (success) {
        WidgetModule.setWidget({
          widgetId: this.widgetWillUpdate.id,
          widget: this.widgetWillUpdate
        });
        const widget: Widget = this.widgetWillUpdate;
        this.setWidgetWillUpdate(null);
        if (QueryRelatedWidget.isQueryRelatedWidget(widget)) {
          ZoomModule.registerZoomData(widget);
          DashboardControllerModule.setAffectFilterWidget(widget);
          QuerySettingModule.setQuerySetting({ id: widget.id, query: widget.setting });
          return DashboardControllerModule.renderChartOrFilter({ widget: widget, forceFetch: true });
        } else {
          return Promise.resolve();
        }
      }
    }
  }

  @Action
  private handleAddWidgetToDashboard() {
    if (this.widgetWillAddToDashboard) {
      const widget: Widget = this.widgetWillAddToDashboard;
      this.setWidgetWillAddToDashboard(null);
      const position: Position = PositionUtils.getPosition(widget);
      return WidgetModule.handleCreateNewWidget({ widget: widget, position: position }).then(widget => {
        WidgetModule.addWidget({
          widget: widget,
          position: position
        });

        if (QueryRelatedWidget.isQueryRelatedWidget(widget)) {
          Log.debug('handleCreateNewWidget::', widget);
          QuerySettingModule.setQuerySetting({
            id: widget.id,
            query: widget.setting
          });
          DashboardControllerModule.initAffectFilterWidgets([widget]);
        }
      });
    }
  }

  @Mutation
  private setDashboardId(id: DashboardId) {
    this.dashboardId = id;
    DashboardControllerModule.setDashboardId(id);
  }

  @Action
  private loadMainDateFilterMode(dashboard: Dashboard) {
    if (dashboard.mainDateFilter) {
      this.setMainDateFilter(dashboard.mainDateFilter);
      const data = this.dataManager.getMainDateFilterMode(dashboard.id);
      if (data) {
        FilterModule.loadDateRangeFilter(data);
        this.setMainDateFilterMode(data.mode);
      }
    }
  }
}

export const DashboardModule = getModule(DashboardStore);
