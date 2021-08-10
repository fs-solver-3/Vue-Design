/*
 * @author: tvc12 - Thien Vi
 * @created: 5/25/21, 5:07 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 5/25/21, 4:51 PM
 */

import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { ChartInfo, DashboardId, DIMap, Position, TextWidget, Widget, WidgetId, Widgets } from '@core/domain/Model';
import store from '@/store';
import { DashboardModule } from '@/screens/DashboardDetail/stores/dashboard/DashboardStore';
import { Inject } from 'typescript-ioc';
import { DashboardService } from '@core/services';
import { Stores, WidgetPosition } from '@/shared';
import { DIException } from '@core/domain/Exception';
import { Vue } from 'vue-property-decorator';
import { ChartUtils, ListUtils, MapUtils, PositionUtils } from '@/utils';
import { TrackingService } from '@core/tracking/service/tracking.service';
import { QueryRelatedWidget } from '@core/domain/Model/Widget/Chart/QueryRelatedWidget';
import { WidgetAction } from '@core/tracking/domain/tracking_data';
import { Log } from '@core/utils';

@Module({ namespaced: true, store: store, dynamic: true, name: Stores.widgetStore })
export class WidgetStore extends VuexModule {
  widgets: Widget[] = [];
  mapPosition: DIMap<Position> = {};

  // get allCharts(): ChartInfo[] {
  //   return this.widgets.filter((widget): widget is ChartInfo => widget instanceof ChartInfo);
  // }
  @Inject
  private dashboardService!: DashboardService;
  @Inject
  private trackingService!: TrackingService;

  get allQueryWidgets(): QueryRelatedWidget[] {
    return this.widgets.filter((widget): widget is QueryRelatedWidget => widget.className == Widgets.Chart);
  }

  get currentMaxZIndex(): number {
    return PositionUtils.getMaxZIndex(this.mapPosition);
  }

  get widgetAsMap(): DIMap<Widget> {
    const widgets = this.widgets || [];
    const widgetAsMap: DIMap<Widget> = {};
    widgets.forEach((value, key) => {
      widgetAsMap[value.id] = value;
    });
    return widgetAsMap;
  }

  @Mutation
  setWidgets(widgets: Widget[]) {
    this.widgets = widgets;
  }

  @Mutation
  setMapPosition(mapPosition: DIMap<Position>) {
    this.mapPosition = mapPosition;
  }

  @Mutation
  addWidget(payload: WidgetPosition) {
    const { position, widget } = payload;
    const id = widget.id;
    this.widgets.push(widget);
    Vue.set(this.mapPosition, id, position);
  }

  @Mutation
  deleteWidget(payload: { id: WidgetId }) {
    const { id } = payload;
    this.mapPosition = MapUtils.remove(this.mapPosition, id);
    this.widgets = ListUtils.remove<Widget>(this.widgets, item => item.id == id);
  }

  @Mutation
  setWidget(payload: { widgetId: number; widget: Widget }) {
    const { widget, widgetId } = payload;
    Log.debug('setWidget::', widgetId, widget);
    this.widgets = ListUtils.remove<Widget>(this.widgets, item => item.id == widgetId);
    this.widgets.push(widget);
    // Vue.set(this._dashboard, 'widgets', newWidget);
  }

  @Mutation
  setPosition(payload: { id: number; newPosition: Position }) {
    const { id, newPosition } = payload;
    this.mapPosition[id] = newPosition;
    Vue.set(this.mapPosition, id, newPosition);
  }

  @Action
  async saveWidgetPosition(): Promise<void> {
    if (ChartUtils.isMobile()) {
      return Promise.resolve();
    } else {
      const dashboardId: DashboardId | undefined = DashboardModule.id;
      if (dashboardId && this.mapPosition) {
        const position = PositionUtils.calculateZIndex(this.mapPosition);
        await this.dashboardService.resizeWidgets(dashboardId, position);
      }
    }
  }

  @Action
  async handleCreateNewWidget(payload: WidgetPosition): Promise<Widget> {
    const dashboardId = DashboardModule.id;
    const dashboardName = DashboardModule.dashboardTitle;
    if (dashboardId) {
      try {
        return await this.dashboardService.createWidget(dashboardId, payload.widget, payload.position).then(widget => {
          this.trackingService.trackWidget({
            action: WidgetAction.Create,
            widgetType: widget.className,
            chartFamilyType: Widget.getChartFamilyType(widget) || '',
            chartType: Widget.getChartType(widget) || '',
            widgetId: widget.id,
            widgetName: widget.name,
            dashboardId: dashboardId,
            dashboardName: dashboardName
          });
          return widget;
        });
      } catch (ex) {
        this.trackingService.trackWidget({
          action: WidgetAction.Create,
          dashboardId: dashboardId,
          dashboardName: dashboardName,
          widgetType: payload.widget.className,
          chartFamilyType: Widget.getChartFamilyType(payload.widget) || '',
          chartType: Widget.getChartType(payload.widget) || '',
          widgetId: payload.widget.id,
          widgetName: payload.widget.name,
          isError: true
        });
        throw ex;
      }
    } else {
      throw new DIException('Dashboard id not exists');
    }
  }

  @Action
  handleCreateTextWidget(textWidget: TextWidget) {
    // TODO: loading when create text
    const position: Position = Position.defaultForText();
    const widgetPosition = {
      widget: textWidget,
      position: position
    };
    return this.handleCreateNewWidget(widgetPosition)
      .then(widget => {
        return this.addWidget({
          widget: widget,
          position: position
        });
      })
      .catch(ex => {
        Log.debug('createTextWidget::', ex);
      });
  }

  @Action
  async handleDeleteWidget(widget: Widget): Promise<boolean> {
    const dashboardId = DashboardModule.id;
    const dashboardName = DashboardModule.dashboardTitle;

    if (dashboardId) {
      try {
        const success = await this.dashboardService.deleteWidget(dashboardId, widget.id);
        if (success) {
          this.deleteWidget({ id: widget.id });
        }
        this.trackingService.trackWidget({
          action: WidgetAction.Delete,
          dashboardId: dashboardId,
          dashboardName: dashboardName,
          widgetType: widget.className,
          chartFamilyType: Widget.getChartFamilyType(widget) || '',
          chartType: Widget.getChartType(widget) || '',
          widgetId: widget.id,
          widgetName: widget.name,
          isError: !success
        });
        return success;
      } catch (error) {
        this.trackingService.trackWidget({
          action: WidgetAction.Delete,
          dashboardId: dashboardId,
          dashboardName: dashboardName,
          widgetType: widget.className,
          chartFamilyType: Widget.getChartFamilyType(widget) || '',
          chartType: Widget.getChartType(widget) || '',
          widgetId: widget.id,
          widgetName: widget.name,
          isError: true
        });
        throw error;
      }
    } else {
      return false;
    }
  }

  @Action({ rawError: true })
  async updateTitleWidget(payload: { widget: Widget; newName: string }): Promise<void> {
    const { widget, newName } = payload;
    const clonedWidget = Widget.fromObject(widget);
    clonedWidget.setTitle(newName);
    const result: boolean = await this.handleUpdateWidget(clonedWidget);
    if (result) {
      this.setWidget({
        widgetId: clonedWidget.id,
        widget: clonedWidget
      });
    } else {
      return Promise.reject(new DIException('Cannot edit title of this widget'));
    }
  }

  @Action({ rawError: true })
  async handleUpdateWidget(widget: Widget): Promise<boolean> {
    const dashboardId = DashboardModule.id;
    const dashboardName = DashboardModule.dashboardTitle;
    if (dashboardId) {
      try {
        const result = await this.dashboardService.editWidget(dashboardId, widget.id, widget);
        this.trackingService.trackWidget({
          action: WidgetAction.Edit,
          dashboardId: dashboardId,
          dashboardName: dashboardName,
          widgetType: widget.className,
          chartFamilyType: Widget.getChartFamilyType(widget) || '',
          chartType: Widget.getChartType(widget) || '',
          widgetId: widget.id,
          widgetName: widget.name,
          isError: !result
        });
        return result;
      } catch (error) {
        this.trackingService.trackWidget({
          action: WidgetAction.Edit,
          dashboardId: dashboardId,
          dashboardName: dashboardName,
          widgetType: widget.className,
          chartFamilyType: Widget.getChartFamilyType(widget) || '',
          chartType: Widget.getChartType(widget) || '',
          widgetId: widget.id,
          widgetName: widget.name,
          isError: true
        });
        return false;
      }
    } else {
      return false;
    }
  }

  @Action
  async handleDuplicateWidget(widget: Widget): Promise<Widget> {
    const dashboardId = DashboardModule.id;
    const dashboardName = DashboardModule.dashboardTitle;
    if (this.mapPosition[widget.id]) {
      const currentPosition = this.mapPosition[widget.id];
      const newPosition: Position = Position.from(currentPosition);
      const widgetPosition: WidgetPosition = { position: newPosition, widget: widget };
      try {
        const newWidget: Widget = await this.handleCreateNewWidget(widgetPosition);
        this.trackingService.trackWidget({
          action: WidgetAction.Duplicate,
          dashboardId: dashboardId || 0,
          dashboardName: dashboardName,
          widgetType: newWidget.className,
          chartFamilyType: Widget.getChartFamilyType(newWidget) || '',
          chartType: Widget.getChartType(newWidget) || '',
          widgetId: newWidget.id,
          widgetName: newWidget.name
        });
        await this.addWidget({ widget: newWidget, position: newPosition });
        return newWidget;
      } catch (ex) {
        return Promise.reject(ex);
      }
    } else {
      return Promise.reject(new DIException('handleDuplicateWidget:: Unknown exception'));
    }
  }

  @Mutation
  private reset() {
    this.widgets = [];
    this.mapPosition = {};
  }
}

export const WidgetModule = getModule(WidgetStore);
