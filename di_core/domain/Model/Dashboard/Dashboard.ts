import { DashboardId, DashboardSetting, DIMap, MainDateFilter, Position, Widget } from '@core/domain/Model';

export class Dashboard {
  id: DashboardId;
  name: string;
  /**
   * @deprecated unused
   */
  mainDateFilter?: MainDateFilter;
  ownerId: string;
  widgets?: Widget[];
  widgetPositions?: DIMap<Position>;
  setting: DashboardSetting;

  constructor(
    id: DashboardId,
    name: string,
    ownerId: string,
    mainDateFilter?: MainDateFilter,
    widgets?: Widget[],
    widgetPositions?: DIMap<Position>,
    setting?: DashboardSetting
  ) {
    this.id = id;
    this.name = name;
    this.mainDateFilter = mainDateFilter;
    this.ownerId = ownerId;
    this.widgets = widgets;
    this.widgetPositions = widgetPositions;
    this.setting = setting ?? DashboardSetting.default();
  }

  static fromObject(obj: Dashboard): Dashboard {
    const mainDateFilter = obj.mainDateFilter ? MainDateFilter.fromObject(obj.mainDateFilter) : void 0;
    const widgets = obj.widgets ? obj.widgets.map(widget => Widget.fromObject(widget)) : [];
    const positions = { ...obj.widgetPositions };
    const setting: DashboardSetting = obj.setting ? DashboardSetting.fromObject(obj.setting) : DashboardSetting.default();
    return new Dashboard(obj.id, obj.name, obj.ownerId, mainDateFilter, widgets, positions, setting);
  }
}
