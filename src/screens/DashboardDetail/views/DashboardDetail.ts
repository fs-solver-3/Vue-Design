import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { NavigationGuardNext } from 'vue-router/types/router';
import { ChartInfo, DIException, TextWidget } from '@core/domain';
import { StringUtils } from '@/utils/string.utils';
import {
  DashboardControllerModule,
  DashboardModalModule,
  DashboardModeModule,
  DashboardModule,
  DataModule,
  DrilldownDataStoreModule,
  FilterModule,
  QuerySettingModule,
  RenderControllerModule,
  WidgetModule
} from '@/screens/DashboardDetail/stores';
import EditTextModal from '@/screens/DashboardDetail/components/EditTextModal.vue';
import DashboardHeader from '@/screens/DashboardDetail/components/DashboardHeader.vue';
import Dashboard from '@/screens/DashboardDetail/components/Dashboard/Dashboard.vue';
import EmptyDashboard from '@/screens/DashboardDetail/components/EmptyDashboard.vue';
import { DashboardMode, Status } from '@/shared';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { Routers } from '@/shared/enums/routers.enum';
import { RouteUtils } from '@/utils/routes.utils';
import { Inject } from 'typescript-ioc';
import { DataManager } from '@core/services';
import { PermissionHandlerModule } from '@/store/modules/permission_handler.store';
import { ActionType, ResourceType } from '@/utils/permission_utils';
import ChartComponents from '@chart/index';
import { ZoomModule } from '@/store/modules/zoom.store';
import WidgetFullSizeModal from '@/screens/DashboardDetail/components/WidgetFullSize/WidgetFullScreenModal.vue';
import { WidgetFullSizeHandler } from '@/screens/DashboardDetail/intefaces/WidgetFullSizeHandler';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { AuthenticationModule } from '@/store/modules/authentication.store';
import { Log } from '@core/utils';
import GridStackComponents from '@/shared/components/GridStack/install';
import { PopupUtils } from '@/utils/popup.utils';
import ErrorWidget from '@/shared/components/ErrorWidget.vue';
import { TableTooltipUtils } from '@chart/CustomTable/TableTooltipUtils';
import { ThemeModule } from '@/store/modules/theme.store';
import { DashboardThemeType } from '@core/domain/Model/Dashboard/Setting/DashboardThemeType';

Vue.use(ChartComponents);
Vue.use(GridStackComponents);

@Component({
  inheritAttrs: true,
  components: {
    DashboardHeader,
    EmptyDashboard,
    Dashboard,
    EditTextModal,
    StatusWidget,
    WidgetFullScreenModal: WidgetFullSizeModal,
    ErrorWidget
  }
})
export default class DashboardDetail extends Vue implements WidgetFullSizeHandler {
  private static readonly FIXED_STYLE: string = 'bar-fixed';
  @Inject
  private readonly dataManager!: DataManager;
  @Ref()
  private readonly contextMenu: any;
  @Ref()
  private readonly editTextModal: any;
  @Ref()
  private readonly shareModal: any;
  @Ref()
  private readonly actionBar?: HTMLElement;
  @Ref()
  private readonly widgetFullScreenModal!: WidgetFullSizeModal;

  @Ref()
  private readonly dashboardHeader?: DashboardHeader;

  get dashboardId(): number {
    return RouteUtils.getDashboardId(this.$route);
  }

  get token(): string | undefined {
    return RouteUtils.getToken(this.$route);
  }

  get dashboardPaddingClass(): any {
    return {
      'full-screen-mode': this.isFullScreen,
      'tv-mode': this.isTVMode,
      'normal-mode': !(this.isFullScreen || this.isTVMode)
    };
  }

  private get mode(): DashboardMode {
    return DashboardModeModule.mode;
  }

  private get isFullScreen(): boolean {
    return DashboardModeModule.isFullScreen;
  }

  private get isTVMode(): boolean {
    return DashboardModeModule.isTVMode;
  }

  private get errorMessage(): string {
    return DashboardModule.errorMessage;
  }

  private get hasWidget(): boolean {
    return DashboardModule.hasWidget;
  }

  private get dashboardStatus(): Status {
    return DashboardModule.dashboardStatus;
  }

  private get isLogin(): boolean {
    return RouteUtils.isLogin();
  }

  private get dashboardStyle(): CSSStyleDeclaration {
    switch (this.mode) {
      case DashboardMode.Edit:
        return {
          paddingBottom: '148px'
        } as any;
      default:
        return {
          paddingBottom: '32px'
        } as any;
    }
  }

  private get allActions(): Set<ActionType> {
    return PermissionHandlerModule.allActions as Set<ActionType>;
  }

  private get statusClass(): any {
    return {
      'status-loading': this.dashboardStatus == Status.Loading
    };
  }

  @Watch('allActions')
  async onActionsChanged(allActions: Set<ActionType>) {
    await DashboardModeModule.handleActionChange(allActions);
    if (DashboardModule.previousPage?.name == Routers.chartBuilder) {
      DashboardModeModule.setMode(DashboardMode.Edit);
    }
  }

  @Watch('hasWidget')
  onHasWidgetChanged(currentValue: boolean, oldValue: boolean): void {
    const isEmptyWidget = oldValue && !currentValue;
    if (isEmptyWidget && this.dashboardHeader) {
      this.dashboardHeader.handleResetFilter();
    }
  }

  async created() {
    if (RouteUtils.isLogin() || RouteUtils.isHaveToken()) {
      await this.loadDashboard();
      await this.loadPermissions();
    } else {
      await AuthenticationModule.logout();
    }
  }

  async handleEditText(textWidget: TextWidget) {
    if (StringUtils.isNotEmpty(textWidget.content)) {
      try {
        const isSuccess: boolean = await WidgetModule.handleUpdateWidget(textWidget);
        if (isSuccess) {
          WidgetModule.setWidget({
            widgetId: textWidget.id,
            widget: textWidget
          });
        }
      } catch (ex) {
        this.showError('Edit text failure! Try again later', ex);
      }
    }
  }

  handleCreateText(textWidget: TextWidget) {
    if (StringUtils.isNotEmpty(textWidget.content)) {
      WidgetModule.handleCreateTextWidget(textWidget).catch(ex => this.showError('Create text failure! Try again later', ex));
    }
  }

  showError(reason: string, ex: DIException): void {
    Log.error('DashboardDetail::showError', ex);
    PopupUtils.showError(reason);
  }

  // hook
  beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext<any>) {
    try {
      RouteUtils.ensureDashboardIdIsValid(to);
      const dashboardId: number = RouteUtils.getDashboardId(to);
      Log.debug('dashboardId::', dashboardId);
      DashboardModule.loadThemeFromLocal(dashboardId);
      RenderControllerModule.readyRequestRender();
      DashboardModule.setPreviousPage(from);
      if (from && from.name != Routers.chartBuilder) {
        DashboardModule.setMyDataPage(from);
      }
      next();
    } catch (e) {
      if (e instanceof DIException) {
        // will handle ex in here
      } else {
        // Exception not handle yet
        Log.error('Exception in beforeRouteEnter::', e?.message);
      }
      next({ name: Routers.notFound });
    }
  }

  beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext<any>) {
    next();
    Log.debug('DashboardDetail::beforeRouteLeave::', from.name, to.name);
    if (to.name === Routers.chartBuilder) {
      if (DashboardModeModule.canEdit) {
        WidgetModule.saveWidgetPosition();
      }
    } else {
      // TODO: remove all token
      // TODO: clear all permission!! change here in the future
      PermissionHandlerModule.reset();
    }
    RenderControllerModule.reset();
    DashboardModule.reset();
    DashboardControllerModule.reset();
    DataModule.reset();
    ZoomModule.reset();
    FilterModule.reset();
    DashboardModeModule.setMode(DashboardMode.View);
    DrilldownDataStoreModule.reset();
    QuerySettingModule.reset();
  }

  showFullSize(chartInfo: ChartInfo): void {
    Log.debug('handleShowWidgetFullScreen::', chartInfo.id);
    this.widgetFullScreenModal.show(chartInfo);
  }

  hideFullSize(): void {
    this.widgetFullScreenModal.hide();
  }

  mounted() {
    document.documentElement.classList.add('root-dashboard-theme', 'root-dashboard-popover-theme');
    DashboardModalModule.contextMenu = this.contextMenu;
    DashboardModalModule.editTextModal = this.editTextModal;
    DashboardModalModule.shareModal = this.shareModal;
    this.registerEvents();
  }

  beforeDestroy() {
    Log.debug('beforeDestroy::');
    this.unregisterEvents();
    document.documentElement.classList.remove('root-dashboard-theme', 'root-dashboard-popover-theme');
  }

  private async loadPermissions() {
    if (DashboardModule.isOwner) {
      Log.debug('DashboardDetail::created::isOwner:: true');
      PermissionHandlerModule.setCurrentActionData({
        token: this.dataManager.getToken(),
        actionsFromToken: [],
        actionsFromUser: [ActionType.all, ActionType.edit, ActionType.view, ActionType.create, ActionType.delete, ActionType.copy]
      });
    } else {
      await PermissionHandlerModule.loadPermittedActions({
        token: this.dataManager.getToken(),
        session: this.dataManager.getSession(),
        resourceType: ResourceType.dashboard,
        resourceId: this.dashboardId,
        actions: [ActionType.all, ActionType.edit, ActionType.view, ActionType.create, ActionType.delete, ActionType.copy]
      });
    }
  }

  private registerEvents() {
    this.$root.$on(DashboardEvents.showWidgetFullSize, this.showFullSize);
    this.$root.$on(DashboardEvents.hideWidgetFullSize, this.hideFullSize);
    window.onscroll = this.handleScroll;
  }

  private unregisterEvents() {
    this.$root.$off(DashboardEvents.showWidgetFullSize, this.showFullSize);
    this.$root.$off(DashboardEvents.hideWidgetFullSize, this.hideFullSize);
    window.onscroll = null;
  }

  private async loadDashboard(): Promise<void> {
    try {
      await DashboardModule.handleLoadDashboard(+this.dashboardId);
      await DashboardModule.handleUpdateOrAddNewWidgetFromChartBuilder();
      // TODO: apply filter when have dashboard
      await DashboardControllerModule.renderAllChartOrFilters();
    } catch (ex) {
      Log.error('loadDashboard::error', ex);
      // Ignored
    }
  }

  private handleScroll() {
    if (this.actionBar && this.dashboardStatus == Status.Loaded) {
      const isStickyHeader = window.pageYOffset >= this.actionBar.offsetTop && this.actionBar.offsetTop !== 0;
      if (isStickyHeader) {
        this.actionBar.classList.add(DashboardDetail.FIXED_STYLE);
      } else {
        this.actionBar.classList.remove(DashboardDetail.FIXED_STYLE);
      }
    }
    TableTooltipUtils.hideTooltip();
  }
}
