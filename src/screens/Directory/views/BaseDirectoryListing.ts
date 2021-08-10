import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { DirectoryModule } from '@/screens/Directory/store/directory.store';
import { DirectoryType, Directory, DirectoryId, Null } from '@core/domain/Model';
import { CreateDashboardRequest, CreateDirectoryRequest, DirectoryPagingRequest, Sort, SortDirection } from '@core/domain/Request';
import ContextMenu from '@/shared/components/ContextMenu.vue';
import { CreateDirectoryMenuItem, DirectoryMenuItem } from '@/shared/constants';
import { ListParentsResponse } from '@core/domain/Response';
import DirectoryCreate from '@/screens/Directory/components/DirectoryCreate.vue';
import DirectoryRename from '@/screens/Directory/components/DirectoryRename.vue';
import DirectoryMove from '@/screens/Directory/components/DirectoryMove.vue';
import DirectoryShare from '@/screens/Directory/components/DirectoryShare.vue';
import { Routers } from '@/shared/enums/routers.enum';
import NProgress from 'nprogress';
import { ContextMenuItem } from '@/shared';
import { LoaderModule } from '@/store/modules/loader.store';
import { Breadcrumbs } from '@/shared/models';
import DiShareModal from '@/shared/components/DiShareModal.vue';
import { isNumber } from 'lodash';
import { ResourceType } from '@/utils/permission_utils';
import { RouteUtils } from '@/utils/routes.utils';
import { Route } from 'vue-router';
import { PopupUtils } from '@/utils/popup.utils';
import { Log } from '@core/utils';

NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

@Component({
  components: {
    DirectoryCreate,
    DirectoryRename,
    DirectoryMove,
    DirectoryShare,
    DiShareModal
  }
})
export default class BaseDirectoryListing extends Vue {
  private fields: any[];
  private listIgnoreClassForContextMenu = ['bi-three-dots-vertical', 'create-new-directory'];
  private isShowCategory: boolean;
  private directoryPagingRequest: DirectoryPagingRequest;

  @Prop({ required: false, type: [Number, Null] })
  private directoryId?: DirectoryId | null;

  @Prop({ required: false, type: Boolean, default: false })
  private isLoading!: boolean;

  @Ref()
  private diContextMenu!: ContextMenu;

  @Ref()
  private mdCreateDirectory!: DirectoryCreate;

  @Ref()
  private mdRenameDirectory!: DirectoryRename;

  @Ref()
  private mdMoveDirectory!: DirectoryMove;

  @Ref()
  private mdShareDirectory!: DiShareModal;

  @Ref()
  private tblDirectoryListing!: any;

  @Ref()
  private diShareModal!: DirectoryShare;

  constructor() {
    super();
    this.directoryPagingRequest = new DirectoryPagingRequest({
      sorts: [
        new Sort({
          field: 'name',
          order: SortDirection.Asc
        })
      ],
      from: 0,
      size: 0
    });
    this.fields = this.getTableFields();
    this.isShowCategory = true;
  }

  private get currentErrorMessage() {
    return DirectoryModule.errorMessage;
  }

  private set currentErrorMessage(newMessage: string | null) {
    DirectoryModule.setErrorMessage(newMessage);
  }

  private get getDirectories(): Directory[] {
    return DirectoryModule.directories;
  }

  private get getBreadcrumbs(): Breadcrumbs[] {
    return DirectoryModule.getBreadcrumbs;
  }

  private get getParents(): ListParentsResponse | null {
    return DirectoryModule.parents;
  }

  private get getNumLoading(): number {
    return LoaderModule.getLoading;
  }

  private get currentRoute(): Route {
    return this.$router.currentRoute;
  }

  created() {
    this.handleSaveRoute();
  }

  handleSaveRoute() {
    if (this.isNavigateToSubSharedWithMe) {
      DirectoryModule.saveRouteName({ routeName: Routers.subShared });
    } else {
      DirectoryModule.saveRouteName({ routeName: Routers.subDirectory });
    }
  }

  @Watch('getParents')
  parentsChanged(parents: ListParentsResponse) {
    this.isShowCategory = !parents || (parents.parentDirectories.length === 1 && parents.parentDirectories[0].parentId < 0);
  }

  showContextMenu(item: Directory, index: number, event: any) {
    event.preventDefault();
    this.tblDirectoryListing.selectRow(index);
    const items = this.getContextMenuItems(item);
    this.diContextMenu.show(event, items);
  }

  showRowOptions(row: any) {
    const items = this.getContextMenuItems(row.item);
    this.diContextMenu.show(event, items);
  }

  sortingChanged(ctx: any) {
    this.diContextMenu.hide();
    const sortDirection = ctx.sortDesc ? SortDirection.Desc : SortDirection.Asc;
    const currentSort = new Sort({ field: ctx.sortBy, order: sortDirection });
    this.directoryPagingRequest.sorts = [currentSort];
    DirectoryModule.list({
      directoryId: this.directoryId,
      sort: this.directoryPagingRequest
    });
  }

  btnAddNewClicked() {
    const items = this.getNewMenuItems();
    this.diContextMenu.show(event, items);
  }

  getBreadcrumbsActiveClass(breadCrumbsSize: number, index: number) {
    if (breadCrumbsSize - 1 === index) {
      return 'active';
    }
    return '';
  }

  @Watch('directoryId', { immediate: true })
  private onDirectoryChanged() {
    Log.debug('onDirectoryChanged', this.directoryId);
    this.loadDirectoryData();
  }

  @Watch('getNumLoading')
  private handleShowProcessBar(newVal: number, oldVal: number) {
    if (newVal === 0) NProgress.done();
    if (oldVal === 0) NProgress.start();
    NProgress.set(1.8 / Math.max(oldVal, newVal));
  }

  private isDashboard(item: Directory): boolean {
    return item.directoryType === DirectoryType.Dashboard;
  }

  private handleNavigateToChildrenFolder(currentDirectory: Directory, index: number, event: any): void {
    Log.debug('currentDirectory:: ', currentDirectory);
    if (currentDirectory) {
      switch (currentDirectory.directoryType) {
        case 'dashboard':
          this.navigateToDashboard(currentDirectory);
          break;
        case 'directory':
          this.navigateToDirectory(currentDirectory);
          break;
      }
    }
  }

  private navigateToDashboard(currentDirectory: Directory): void {
    if (currentDirectory.dashboardId) {
      this.navigateTo(
        Routers.dashboardDetail,
        {
          dashboardId: currentDirectory.dashboardId.toString()
        },
        {
          token: RouteUtils.getToken(this.$router.currentRoute)
        }
      );
    }
  }

  private navigateToDirectory(currentDirectory: Directory): void {
    Log.debug('BaseDirectoryListing::navigateToDirectory::currentDirectory::', currentDirectory);
    Log.debug('BaseDirectoryListing::navigateToDirectory::currentRouter::', this.$router.currentRoute);
    Log.debug('token::', RouteUtils.getToken(this.$router.currentRoute));
    if (this.isNavigateToSubSharedWithMe) {
      DirectoryModule.saveRouteName({ routeName: Routers.subShared });

      this.navigateTo(
        Routers.subShared,
        {
          directoryId: currentDirectory.id.toString()
        },
        {
          token: RouteUtils.getToken(this.$router.currentRoute)
        }
      );
    } else {
      DirectoryModule.saveRouteName({ routeName: Routers.subDirectory });
      this.navigateTo(
        Routers.subDirectory,
        {
          directoryId: currentDirectory.id.toString()
        },
        {
          token: RouteUtils.getToken(this.$router.currentRoute)
        }
      );
    }
  }

  private get isNavigateToSubSharedWithMe() {
    return this.currentRoute.name == Routers.sharedWithMe || this.currentRoute.name == Routers.subShared;
  }

  private navigateTo(name: string, params: {}, query: {}) {
    this.$router
      .push({
        name: name,
        params: params,
        query: query
      })
      .catch(err => {
        if (err.name !== 'NavigationDuplicated' && !err.message.includes('Avoided redundant navigation to current location')) {
          throw err;
        }
      });
  }

  private createDirectory(dirType: string) {
    this.diContextMenu.hide();
    if (dirType === DirectoryType.Dashboard) {
      const newDashboard = new CreateDashboardRequest('', this.directoryId || 0);
      this.mdCreateDirectory.show(newDashboard);
    } else if (dirType === DirectoryType.Directory) {
      const newDirectory = new CreateDirectoryRequest({
        isRemoved: false,
        parentId: this.directoryId,
        directoryType: dirType
      });
      this.mdCreateDirectory.show(newDirectory);
    }
  }

  private share(item: Directory) {
    this.diContextMenu.hide();
    switch (item.directoryType) {
      case 'dashboard':
        this.mdShareDirectory.show(ResourceType.dashboard, item.dashboardId!);
        break;
      default:
        this.mdShareDirectory.show(ResourceType.directory, item.id);
        break;
    }
    Log.debug('Share::item', item);
  }

  private rename(item: Directory) {
    this.diContextMenu.hide();
    this.mdRenameDirectory.show(item);
  }

  private async remove(item: Directory) {
    try {
      this.diContextMenu.hide();
      await DirectoryModule.remove(item.id);
    } catch (err) {
      PopupUtils.showError(err.message);
    }
  }

  private move(item: Directory) {
    this.diContextMenu.hide();
    this.mdMoveDirectory.show(item.id, item.parentDirectory);
  }

  private getTableFields(): any[] {
    return [
      {
        key: 'name',
        sortable: true,
        label: 'Name',
        tdClass: 'td-text-style-primary text-left w-60 unselectable  text-truncate',
        thClass: 'th-text-style text-left w-60'
      },
      {
        key: 'owner.fullName',
        sortable: true,
        label: 'Owner',
        tdClass: 'td-text-style-default text-left unselectable text-truncate',
        thClass: 'th-text-style text-left'
      },
      {
        key: 'menu',
        sortable: false,
        label: '',
        tdClass: 'text-right td-context-menu',
        thClass: 'text-right'
      }
    ];
  }

  private getContextMenuItems(row: Directory): ContextMenuItem[] {
    return [
      {
        text: DirectoryMenuItem.Share,
        click: () => {
          this.share(row);
        }
      },
      {
        text: DirectoryMenuItem.Rename,
        click: () => {
          this.rename(row);
        }
      },
      {
        text: DirectoryMenuItem.MoveTo,
        disabled: true,
        click: () => {
          this.move(row);
        }
      },
      {
        text: DirectoryMenuItem.AddToStarred,
        disabled: true,
        click: () => {
          this.share(row);
        }
      },
      {
        text: DirectoryMenuItem.MakeACopy,
        disabled: true,
        click: () => {
          this.share(row);
        }
      },
      {
        text: DirectoryMenuItem.Download,
        disabled: true,
        click: () => {
          this.share(row);
        }
      },
      {
        text: DirectoryMenuItem.Remove,
        click: () => {
          this.remove(row);
        }
      }
    ];
  }

  private getNewMenuItems(): ContextMenuItem[] {
    return [
      {
        text: CreateDirectoryMenuItem.Folder,
        click: () => {
          this.createDirectory(DirectoryType.Directory);
        }
      },
      {
        text: CreateDirectoryMenuItem.Dashboard,
        click: () => {
          this.createDirectory(DirectoryType.Dashboard);
        }
      },
      {
        text: CreateDirectoryMenuItem.DataImport,
        disabled: true,
        click: () => {
          this.diContextMenu.hide();
        }
      }
    ];
  }

  private handleRetry() {
    if (isNumber(this.directoryId) && !isNaN(this.directoryId)) {
      this.loadDirectoryData();
    } else {
      this.$emit('onLoadRootDirectory');
    }
  }

  private loadDirectoryData() {
    if (isNumber(this.directoryId) && !isNaN(this.directoryId)) {
      this.currentErrorMessage = null;
      if (RouteUtils.isLogin()) {
        DirectoryModule.getListParents(this.directoryId);
      }
      DirectoryModule.list({
        directoryId: this.directoryId,
        sort: this.directoryPagingRequest
      });
    } else {
      this.currentErrorMessage = "Can't load directory! ";
    }
  }

  destroyed() {
    Log.debug('Destroyed BaseDirectoryListing');
    DirectoryModule.reset();
  }
}
