import { Component, Inject, Prop, Provide, Ref, Vue } from 'vue-property-decorator';
import { ContextMenuItem, DashboardMode, DashboardOptions, DateRange } from '@/shared';
import { mapGetters, mapState } from 'vuex';
import { DashboardSetting, DIException, Field, MainDateFilter as DateFilter, MainDateFilterMode, Position, TextWidget } from '@core/domain';
import { DashboardModalModule, DashboardModeModule, DashboardModule, FilterModule, MainDateData, WidgetModule } from '@/screens/DashboardDetail/stores';
import { DataManager } from '@core/services';
import SetupMainDateFilter from '@filter/MainDateFilterV2/SetupMainDateFilter.vue';
import MainDateFilter from '@filter/MainDateFilterV2/MainDateFilter.vue';
import { Routers } from '@/shared/enums/routers.enum';
import { Stores } from '@/shared/enums/stores.enum';
import PermissionWidget from '@/shared/components/PermissionWidget.vue';
import { ActionType, ResourceType } from '@/utils/permission_utils';
import SelectFieldButton from '@/screens/DashboardDetail/components/SelectFieldButton.vue';
import { DI } from '@core/modules';
import { PopupUtils } from '@/utils/popup.utils';
import { RouteUtils } from '@/utils/routes.utils';
import { Log } from '@core/utils';
import { ListUtils } from '@/utils';
import DashboardSettingModal from '@/screens/DashboardDetail/components/DashboardSettingModal/DashboardSettingModal.vue';
import { ApplySetting, SettingBloc, SettingSaved, SettingSaving, SettingState } from '@/screens/DashboardDetail/Bloc';
import { SettingSaveError } from '@/screens/DashboardDetail/Bloc/State/SettingSaveError';
const $ = window.$;

@Component({
  computed: {
    ...mapGetters(Stores.dashboardModeStore, ['isViewMode', 'isFullScreen', 'isTVMode']),
    ...mapState(Stores.dashboardModeStore, ['mode']),
    ...mapState(Stores.dashboardStore, ['mainDateFilter'])
  },
  components: {
    MainDateFilter,
    PermissionWidget,
    SelectFieldButton,
    SetupMainDateFilter,
    DashboardSettingModal
  }
})
export default class DashboardControlBar extends Vue {
  static readonly TO_EDIT_MODE = 'to_edit';
  static readonly TO_VIEW_MODE = 'to_view';
  static readonly TO_FULL_SCREEN_MODE = 'to_full_screen';
  static readonly TO_TV_MODE = 'to_tv_mode';
  @Prop({ type: Boolean, default: false })
  showResetFilters!: boolean;
  isFullScreen!: boolean;
  isTVMode!: boolean;
  isViewMode!: boolean;
  mode!: DashboardMode;
  textWidget!: TextWidget;
  mainDateFilter!: DateFilter;
  date: DateRange = {
    start: '',
    end: ''
  };
  private readonly settingBloc = new SettingBloc();
  @Ref()
  private readonly imagePicker?: HTMLInputElement;

  @Ref()
  private readonly dashboardSettingModal?: DashboardSettingModal;
  private isResetMainDateFilter = false;
  private readonly items: ContextMenuItem[] = [
    {
      text: DashboardOptions.ADD_CHART,
      click: this.handleAddChart
    },
    // {
    //   text: DashboardOptions.ADD_CONTROL,
    //   click: () => Log.debug('Add control'),
    //   disabled: true,
    // },
    // {
    //   text: DashboardOptions.ADD_RULER,
    //   disabled: true,
    //   click: () => Log.debug('Add ruler')
    // },
    {
      text: DashboardOptions.ADD_TEXT,
      click: this.showAddText
    },
    // {
    //   text: DashboardOptions.ADD_LINK,
    //   disabled: true,
    //   click: () => Log.debug('Add link')
    // },
    {
      text: DashboardOptions.ADD_IMAGE,
      click: this.addImage
    }
  ];
  // Provide from DashboardHeader.vue
  @Inject()
  private handleResetFilter?: () => void;

  get getHiddenClass() {
    if (this.isViewMode && !this.mainDateFilter) {
      return 'hidden';
    }
    return '';
  }

  get isShowMainDateFilter() {
    //sua ten
    if (this.mainDateFilter && !this.isResetMainDateFilter) {
      return true;
    }
    return false;
  }

  private get dataManager(): DataManager {
    return DI.get(DataManager);
  }

  private get actionTypes(): Set<ActionType> {
    return DashboardModeModule.actionTypes;
  }

  private get mainDateFilterMode(): MainDateFilterMode {
    return DashboardModule.mainDateFilterMode;
  }

  private get defaultDateRange(): DateRange | null {
    return FilterModule.chosenRange;
  }

  private get isShowResetFilter(): boolean {
    if (this.mode === DashboardMode.Edit) {
      return true;
    }
    return false;
  }

  private get dashboardId(): number | undefined {
    //Todo: not show
    return DashboardModule.id;
  }

  //get Inject from DiCalender.ts
  @Provide()
  handleResetMainDate() {
    this.isResetMainDateFilter = true;
    Log.debug('Catch reset main date filter');
  }

  async switchMode(mode: string): Promise<void> {
    Log.debug('send mode::', mode);

    switch (mode) {
      case DashboardControlBar.TO_VIEW_MODE: {
        const newMode = this.mode == DashboardMode.EditFullScreen ? DashboardMode.ViewFullScreen : DashboardMode.View;
        await this.setupTvMode(false);
        DashboardModeModule.setMode(newMode);
        break;
      }

      case DashboardControlBar.TO_EDIT_MODE: {
        const newMode = this.mode == DashboardMode.ViewFullScreen ? DashboardMode.EditFullScreen : DashboardMode.Edit;
        DashboardModeModule.setMode(newMode);
        break;
      }

      case DashboardControlBar.TO_FULL_SCREEN_MODE: {
        const newMode = this.mode == DashboardMode.View ? DashboardMode.ViewFullScreen : DashboardMode.View;
        DashboardModeModule.setMode(newMode);
        break;
      }

      case DashboardControlBar.TO_TV_MODE: {
        DashboardModeModule.setMode(DashboardMode.TVMode);
        await this.setupTvMode(true);
        break;
      }
    }
  }

  private mounted() {
    $(window.document.body).on('fullscreenchange', this.onFullscreenChange);
  }

  private destroyed() {
    $(window.document.body).off('fullscreenchange', this.onFullscreenChange);
  }

  private async onFullscreenChange() {
    const dashboardEl = $('.grid-stack-container');
    if (!window.document.fullscreenElement) {
      await this.switchMode(DashboardControlBar.TO_VIEW_MODE);
      // remove scale dashboard
      dashboardEl.css({
        transform: ''
      });
    } else {
      // scale dashboard
      if (dashboardEl.length > 0) {
        const dashboardHeight = dashboardEl.height();
        const contentHeight = $('body').height() - 60;
        const scale = contentHeight / dashboardHeight;
        const translateY = ((contentHeight - dashboardHeight) / 2 / contentHeight) * 100;
        Log.info({ dashboardHeight, contentHeight, scale, translateY });
        if (scale < 1) {
          dashboardEl.css({
            transform: `scale(${scale}) translateY(${translateY}%)`
          });
        }
      }
    }
  }

  private async setupTvMode(isTvMode: boolean) {
    if (isTvMode) {
      // request fullscreen
      if (!window.document.fullscreenElement) {
        await window.document.body.requestFullscreen().catch(err => {
          Log.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      }
    } else {
      if (window.document.fullscreenElement) {
        await window.document.exitFullscreen();
      }
    }
  }

  clickAdding(event: MouseEvent) {
    DashboardModalModule.showContextMenu({
      event: event,
      items: this.items
    });
  }

  handleFileSelected(event: any): void {
    if (this.imagePicker && ListUtils.isNotEmpty(this.imagePicker.files)) {
      const file: File = this.imagePicker.files![0];
      const position: Position = Position.defaultForImage();
      DashboardModule.handleUpdateImage(file)
        .then(imageWidget => {
          return WidgetModule.handleCreateNewWidget({
            widget: imageWidget,
            position: position
          });
        })
        .then(widget => {
          WidgetModule.addWidget({ widget: widget, position: position });
        })
        .catch(ex => this.showError('Upload failure! Try again later', ex));
    }
  }

  showError(reason: string, ex: DIException): void {
    //TODO(tvc12): show error here
  }

  clickShare() {
    if (this.dashboardId) {
      Log.debug('DashboardControlBar::clickShare::dashboardId::', this.dashboardId);
      DashboardModalModule.showShareModal({ resourceType: ResourceType.dashboard, resourceId: this.dashboardId });
    } else {
      Log.debug('DashboardControlBar::clickShare::error:: can not get dashboard Id.');
      PopupUtils.showError('Can not get Dashboard Id.');
    }
  }

  async handleEditMainDateFilter(newMainDateFilter: DateFilter) {
    try {
      await DashboardModule.handleEditMainDateFilter(newMainDateFilter);
    } catch (e) {
      Log.debug('DashboardControlBar::handleUploadMainDateFilter::err::', e);
    }
  }

  async handleSetupMainDateFilter(field: Field, mode: MainDateFilterMode) {
    const mainDateFilter: DateFilter = new DateFilter(field, mode);
    try {
      this.handleEditMainDateFilter(mainDateFilter);
      DashboardModule.setMainDateFilter(mainDateFilter);
      const mainDateDate: MainDateData = { mode: mode };
      DashboardModule.saveMainDateFilterMode(mainDateDate);
      DashboardModule.setMainDateFilterMode(mode);
      FilterModule.loadDateRangeFilter(mainDateDate);
      FilterModule.handleMainDateFilterChange();
    } catch (e) {
      Log.debug('dashboardControlBar::handleSetupMainDateFilter::error', e);
    }

    this.isResetMainDateFilter = false;
  }

  beforeDestroy() {
    this.settingBloc.dispose();
  }

  private addImage(): void {
    DashboardModalModule.hideContextMenu();
    this.imagePicker?.click();
  }

  private showAddText() {
    DashboardModalModule.hideContextMenu();
    DashboardModalModule.showEditTextModal({
      textWidget: TextWidget.empty(),
      isEdit: false
    });
  }

  private handleAddChart() {
    const dashboardId = this.$route.params.dashboardId;
    this.dataManager.saveDashboardId(dashboardId);
    if (DashboardModule.databaseHighestUsed) {
      this.dataManager.saveDbHighestUsed(DashboardModule.databaseHighestUsed);
    }
    RouteUtils.navigateToDataBuilder(this.$route, FilterModule.routerFilters);
  }

  private resetFilter(): void {
    if (this.handleResetFilter) {
      this.handleResetFilter();
    }
  }

  private handleClearResetMainDate() {
    if (this.isResetMainDateFilter) {
      this.isResetMainDateFilter = false;
    }
  }

  private showDashboardSetting() {
    if (this.dashboardSettingModal) {
      this.dashboardSettingModal.show({
        setting: DashboardModule.setting,
        onApply: this.handleApplySetting
      });
    } else {
      PopupUtils.showError('Cannot setting current dashboard!');
    }
  }

  private async handleApplySetting(newSetting: DashboardSetting) {
    if (this.dashboardId) {
      DashboardModule.setDashboardSetting(newSetting);
      this.settingBloc.add(new ApplySetting(this.dashboardId, newSetting));
    }
  }

  private handleOnStateChanged(state: SettingState) {
    switch (state.constructor) {
      case SettingSaving:
        Log.debug('handleOnStateChanged::SettingSaving');
        break;
      case SettingSaved:
        Log.debug('handleOnStateChanged::SettingSaved');
        break;
      case SettingSaveError:
        PopupUtils.showError((state as SettingSaveError).message);
        break;
    }
  }
}
