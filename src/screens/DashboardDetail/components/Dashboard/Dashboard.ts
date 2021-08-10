import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import { ChartInfo, DIException, DIMap, Position, Widget, WidgetId } from '@core/domain';
import { DashboardMode, isEdit, isView } from '@/shared';
import WidgetContainer from '@/screens/DashboardDetail/components/WidgetContainer';
import { DashboardModeModule, DashboardModule, WidgetModule } from '@/screens/DashboardDetail/stores';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import DiGridstack from '@/shared/components/GridStack/DiGridstack.vue';
import { ChartUtils, DomUtils } from '@/utils';
import { CustomGridStackOptions } from '@/shared/components/GridStack/CustomGridstack';
import { PopupUtils } from '@/utils/popup.utils';
import { cloneDeep } from 'lodash';
import DrilldownSetting from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/Drilldown/DrilldownSetting.vue';
import { MouseEventData } from '@chart/BaseChart';
import VueContext from 'vue-context';
import WidgetContextMenu from '../WidgetContextMenu.vue';

@Component({
  components: { WidgetContainer, DrilldownSetting, VueContext, WidgetContextMenu }
})
export default class Dashboard extends Vue {
  private enableEdit = false;
  private canSave = true;

  @Ref()
  private readonly gridstack?: DiGridstack;

  @Ref()
  private readonly widgetContextMenu?: WidgetContextMenu;

  private get mode(): DashboardMode {
    return DashboardModeModule.mode;
  }

  private get positions(): DIMap<Position> {
    return DashboardModule.positions;
  }

  private get widgetAsMap(): DIMap<Widget> {
    return DashboardModule.widgetAsMap;
  }

  private get enableOverlap(): boolean {
    return DashboardModule.setting.enableOverlap;
  }

  private get defaultOptions(): CustomGridStackOptions {
    return {
      animate: true,
      column: 24,
      margin: '0.5rem',
      marginUnit: 'rem',
      cellHeight: '92px',
      oneColumnModeDomSort: false,
      disableOneColumnMode: true,
      enableOverlap: this.enableOverlap,
      draggable: {
        scroll: true
      },
      resizable: {
        handles: 'e, se, s, sw, w'
      },
      float: this.enableOverlap,
      alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
  }

  private get getCurrentCursor(): string {
    return this.isEditMode ? 'move' : 'default';
  }

  private get isEditMode(): boolean {
    return isEdit(this.mode);
  }

  private get dashboardStyle(): any {
    return {
      '--next-max-z-index': WidgetModule.currentMaxZIndex + 1
    };
  }

  created() {
    this.enableEdit = DashboardModeModule.isEditMode;
  }

  mounted() {
    this.$nextTick(() => DomUtils.bind('gridstack', this.gridstack));
    this.registerEvents();
  }

  beforeDestroy() {
    this.unregisterEvents();
  }

  @Watch('mode')
  async onModeChanged(newMode: DashboardMode, oldMode: DashboardMode): Promise<void> {
    const isDifferentMode = newMode != oldMode;
    if (isDifferentMode) {
      this.enableEdit = isEdit(newMode);
      if (this.canSave) {
        const isEditToView = isEdit(oldMode) && isView(newMode);
        if (isEditToView) {
          await this.savePosition();
        }
        //clear positions
        this.canSave = false;
      }
    }
  }

  private async savePosition(): Promise<void> {
    try {
      await WidgetModule.saveWidgetPosition();
    } catch (ex) {
      const exception = DIException.fromObject(ex);
      PopupUtils.showError(exception.message);
    }
  }

  private getWidget(id: number): Widget {
    return this.widgetAsMap[id];
  }

  private handleChangePosition(payload: { id: number; position: Position }) {
    if (this.isEditMode) {
      const { position, id } = payload;
      this.canSave = true;
      WidgetModule.setPosition({
        id: id, // default
        newPosition: position
      });

      this.emitResizeEvent(id);
    }
  }

  private emitResizeEvent(id: number) {
    this.$nextTick(() => {
      this.$root.$emit(DashboardEvents.resizeWidget, id);
    });
  }

  private calculateZIndex(position: Position): Position {
    if (this.enableOverlap) {
      const newPosition = cloneDeep(position);
      newPosition.zIndex = WidgetModule.currentMaxZIndex + 1;
      return newPosition;
    } else {
      return cloneDeep(position);
    }
  }

  private handleClickItem(id: WidgetId, position: Position): void {
    if (this.isEditMode && ChartUtils.isDesktop() && this.enableOverlap) {
      const newPosition = this.calculateZIndex(position);
      this.handleChangePosition({ id: id, position: newPosition });
    }
  }

  private registerEvents() {
    this.$root.$on(DashboardEvents.ShowWidgetContextMenu, this.showWidgetContextMenu);
  }

  private unregisterEvents() {
    this.$root.$off(DashboardEvents.ShowWidgetContextMenu, this.showWidgetContextMenu);
  }

  private showWidgetContextMenu(metaData: ChartInfo, mouseEventData: MouseEventData<string>) {
    PopupUtils.hideAllPopup();
    this.widgetContextMenu?.show(metaData, mouseEventData);
  }
}
