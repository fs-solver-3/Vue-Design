/*
 * @author: tvc12 - Thien Vi
 * @created: 2/4/21, 2:28 PM
 */

import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { Inject } from 'typescript-ioc';
import { DashboardService, DirectoryService } from '@core/services';
import { Directory, DirectoryId } from '@core/domain/Model';
import { CreateDashboardRequest, CreateDirectoryRequest, DirectoryPagingRequest } from '@core/domain/Request';
import { ListParentsResponse } from '@core/domain/Response';
import { Breadcrumbs } from '@/shared/models';
import { Routers } from '@/shared/enums/routers.enum';
import { LoaderModule } from '@/store/modules/loader.store';
import router from '@/router/router';
import { TrackingService } from '@core/tracking/service/tracking.service';
import { Properties } from '@datainsider/di-web-analytics/dist/domain';
import { ClassProfiler, MethodProfiler } from '@/shared/profiler/annotation';
import { DashboardAction, DirectoryAction } from '@core/tracking/domain/tracking_data';
import store from '@/store';
import { DIException } from '@core/domain/Exception';
import { ResourceType } from '@/utils/permission_utils';
import { Log } from '@core/utils';
import { BreadcrumbMode, BreadcrumbUtils } from '@/utils/breadcrumb.utils';

export interface DirectoryState {
  directories: Directory[];
  isReloadDirectories: boolean;
  parents: ListParentsResponse;
  errorMessage: string;
}

@Module({ store, name: 'directoryStore', dynamic: true, namespaced: true })
@ClassProfiler({ prefix: 'DirectoryStore', getIncluded: false })
export default class DirectoryStore extends VuexModule {
  // state
  public directories: DirectoryState['directories'] = [];
  public parents: DirectoryState['parents'] | null = null;
  public errorMessage: DirectoryState['errorMessage'] | null = null;
  public routeName: string = Routers.subDirectory;

  @Inject
  private directoryService!: DirectoryService;
  @Inject
  private dashboardService!: DashboardService;

  @Inject
  private trackingService!: TrackingService;

  get getBreadcrumbs(): Breadcrumbs[] {
    if (!this.parents) {
      return [];
    }
    const breadcrumbMode = BreadcrumbUtils.getBreadcrumbMode(this.parents);
    switch (breadcrumbMode) {
      case BreadcrumbMode.Fully:
        return BreadcrumbUtils.getFullyBreadcrumbs(this.parents, this.routeName);
      case BreadcrumbMode.Shortly:
        return BreadcrumbUtils.getShortlyBreadcrumbs(this.parents, this.routeName);
    }
  }

  @Mutation
  public setDirectories(directories: Directory[]): void {
    this.directories = directories;
  }

  @Mutation
  public setParents(parents: ListParentsResponse): void {
    this.parents = parents;
  }

  // actions
  @MethodProfiler({ prefix: 'DirectoryStore', name: 'getDirectoryList' })
  @Action({ rawError: true })
  async list(payload: { directoryId: any; sort: DirectoryPagingRequest }): Promise<void> {
    LoaderModule.startLoading();
    try {
      const directories = await this.directoryService.list(payload.directoryId, payload.sort);
      this.trackingService.trackDirectory({
        action: DirectoryAction.View,
        directoryId: payload.directoryId || 0
      });
      this.setDirectories(directories);
    } catch (ex) {
      Log.debug('render error', ex);
      this.trackingService.trackDirectory({
        action: DirectoryAction.View,
        directoryId: payload.directoryId || 0,
        isError: true
      });
      this.renderError(ex);
    } finally {
      LoaderModule.finishLoading();
    }
  }

  @Action({ rawError: true })
  async createFolder(payload: CreateDirectoryRequest): Promise<void> {
    try {
      return await this.directoryService.create(payload).then(directory => {
        if (directory.id) {
          this.trackingService.trackDirectory({
            action: DirectoryAction.Create,
            directoryId: directory.id,
            parentDirectoryId: payload.parentId,
            directoryName: payload.name
          });
          router.push({
            name: Routers.subDirectory,
            params: {
              directoryId: directory.id.toString()
            }
          });
        }
      });
    } catch (error) {
      Log.debug('create Folder Error');
      this.trackingService.trackDirectory({
        action: DirectoryAction.Create,
        directoryId: 0,
        parentDirectoryId: payload.parentId,
        directoryName: payload.name,
        isError: true
      });
      throw DIException.fromObject(error);
    }
  }

  @Action({ rawError: true })
  async createDashboard(payload: CreateDashboardRequest): Promise<void> {
    try {
      return await this.dashboardService.create(payload).then(dashboard => {
        if (dashboard.id) {
          this.trackingService.trackDashboard({
            action: DashboardAction.Create,
            dashboardId: dashboard.id,
            dashboardName: dashboard.name
          });
          router.push({
            name: Routers.dashboardDetail,
            params: {
              dashboardId: dashboard.id.toString()
            }
          });
        }
      });
    } catch (error) {
      this.trackingService.trackDashboard({
        action: DashboardAction.Create,
        dashboardId: 0,
        dashboardName: payload.name,
        isError: true
      });

      throw DIException.fromObject(error);
    }
  }

  @Action({ rawError: true })
  async renameFolder(payload: { id: number; name: string; oldName: string }) {
    const { id, name, oldName } = payload;
    try {
      await this.directoryService.rename(id, name).then(result => {
        this.handleRename({ id: id, name: name, resourceType: ResourceType.directory });

        this.trackingService.trackDirectory({
          action: DirectoryAction.Rename,
          directoryId: id,
          directoryName: oldName,
          extraProperties: { directoryNewName: name } as Properties,
          isError: !result
        });
      });
    } catch (error) {
      this.trackingService.trackDirectory({
        action: DirectoryAction.Rename,
        directoryId: id,
        directoryName: oldName,
        extraProperties: { directoryNewName: name } as Properties,
        isError: true
      });
      throw DIException.fromObject(error);
    }
  }

  @Action({ rawError: true })
  async renameDashboard(payload: { id: number; name: string; oldName: string }) {
    const { id, name: newName, oldName } = payload;
    try {
      await this.dashboardService.rename(id, newName).then(result => {
        this.handleRename({ id: id, name: newName, resourceType: ResourceType.dashboard });

        this.trackingService.trackDashboard({
          action: DashboardAction.Rename,
          dashboardId: id,
          dashboardName: oldName,
          extraProperties: { dashboardNewName: newName } as Properties,
          isError: !result
        });
      });
    } catch (error) {
      this.trackingService.trackDashboard({
        action: DashboardAction.Rename,
        dashboardId: id,
        extraProperties: { dashboardNewName: newName } as Properties,
        isError: true
      });
      throw DIException.fromObject(error);
    }
  }

  @Action
  async handleRename(payload: { id: number; name: string; resourceType: ResourceType }) {
    const updatedDirectories = [...this.directories];
    const updatedIndex = await this.getDirectoryIndexById({ id: payload.id, directories: updatedDirectories, resourceType: payload.resourceType });
    const updatedDirectory = Directory.fromObject({ ...updatedDirectories[updatedIndex], name: payload.name });
    updatedDirectories.splice(updatedIndex, 1, updatedDirectory);
    Log.debug('DirectoryStore::handleRenameFolder::updatedDirectories::', updatedDirectories);
    Log.debug('DirectoryStore::handleRenameFolder::updatedDirectory::', updatedDirectory, updatedIndex);
    this.setDirectories(updatedDirectories);
  }

  @Action
  getDirectoryIndexById(payload: { id: number; directories: Directory[]; resourceType: ResourceType }): Promise<number> {
    switch (payload.resourceType) {
      case ResourceType.dashboard:
        return Promise.resolve(payload.directories.findIndex(item => item.dashboardId === payload.id));
      default:
        return Promise.resolve(payload.directories.findIndex(item => item.id === payload.id));
    }
  }

  @Action({ rawError: true })
  async remove(id: DirectoryId) {
    try {
      await this.directoryService.remove(id).then(result => {
        this.handleRemove({ id: id });

        this.trackingService.trackDirectory({
          action: DirectoryAction.Delete,
          directoryId: id,
          isError: !result
        });
      });
    } catch (error) {
      this.trackingService.trackDirectory({
        action: DirectoryAction.Delete,
        directoryId: id,
        isError: true
      });
      throw DIException.fromObject(error);
    }
  }
  //todo:  add function handleRemove
  @Action
  handleRemove(payload: { id: number }) {
    const updatedDirectories = [...this.directories];
    const updatedIndex = updatedDirectories.findIndex(item => item.id === payload.id);
    updatedDirectories.splice(updatedIndex, 1);
    Log.debug('DirectoryStore::handleRenameFolder::updatedDirectories::', updatedDirectories);
    this.setDirectories(updatedDirectories);
  }

  @Action
  async move(payload: any) {
    try {
      await this.directoryService.move(payload.id, payload.toParentId).then(result => {
        //this.handleMove()
        this.trackingService.trackDirectory({
          action: DirectoryAction.Move,
          directoryId: payload.id || 0,
          isError: !result
        });
      });
    } catch (error) {
      this.trackingService.trackDirectory({
        action: DirectoryAction.Move,
        directoryId: payload.id || 0,
        isError: false
      });
    }
  }

  @Action({ rawError: true })
  getListParents(id: DirectoryId): Promise<void> {
    LoaderModule.startLoading();
    return this.directoryService
      .getParents(id)
      .then(response => this.setParents(response))
      .finally(() => LoaderModule.finishLoading());
  }

  @Action({ rawError: true })
  public getIdRootDirectory(): Promise<number> {
    LoaderModule.startLoading();
    return this.directoryService
      .getRootDir()
      .then(directory => directory.id)
      .finally(() => LoaderModule.finishLoading());
  }

  @Mutation
  setErrorMessage(newMessage: string | null) {
    this.errorMessage = newMessage;
  }

  @Mutation
  private renderError(ex: any) {
    Log.debug('render Error:: ', ex);
    const apiException = DIException.fromObject(ex);
    this.errorMessage = apiException.message ?? 'Load directory error.';
  }

  @Mutation
  saveRouteName(payload: { routeName: string }) {
    this.routeName = payload.routeName;
  }

  @Mutation
  reset() {
    this.directories = [];
    this.parents = null;
    this.errorMessage = null;
  }
}
export const DirectoryModule = getModule(DirectoryStore);
