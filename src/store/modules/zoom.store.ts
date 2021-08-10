import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { DateFunctionTypes, Stores, ZoomData, ZoomLevelNode } from '@/shared';
import { ChartInfo, QueryRelatedWidget, WidgetId, Zoomable } from '@core/domain/Model';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';

export interface ZoomState {
  zoomLevels: ZoomLevelNode[][];
  zoomLevelsAsMap: Map<string, number>;
  zoomDataAsMap: Map<WidgetId, ZoomData>;
}

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.zoomStore })
export class ZoomStore extends VuexModule {
  zoomNodes: ZoomState['zoomLevels'] = [];
  zoomLevelsAsMap: ZoomState['zoomLevelsAsMap'] = new Map<string, number>();
  zoomDataAsMap: ZoomState['zoomDataAsMap'] = new Map<WidgetId, ZoomData>();

  @Mutation
  registerMultiZoomData(widgets: QueryRelatedWidget[]) {
    widgets.forEach(widget => {
      const isEnableZoom: boolean = widget.setting.getVisualizationSetting()?.isEnableZoom() ?? false;
      if (isEnableZoom && Zoomable.isZoomable(widget.setting)) {
        this.zoomDataAsMap.set(widget.id, widget.setting.zoomData);
      }
    });
  }

  @Mutation
  registerZoomData(widget: QueryRelatedWidget) {
    const isEnableZoom: boolean = widget.setting.getVisualizationSetting()?.isEnableZoom() ?? false;
    if (isEnableZoom && Zoomable.isZoomable(widget.setting)) {
      this.zoomDataAsMap.set(widget.id, widget.setting.zoomData);
    }
  }

  @Mutation
  registerZoomDataById(payload: { id: WidgetId; query: QuerySetting }) {
    const isEnableZoom: boolean = payload.query.getVisualizationSetting()?.isEnableZoom() ?? false;
    if (isEnableZoom && Zoomable.isZoomable(payload.query)) {
      this.zoomDataAsMap.set(payload.id, payload.query.zoomData);
    }
  }

  @Mutation
  deleteZoomData(id: WidgetId) {
    this.zoomDataAsMap.delete(id);
  }

  @Mutation
  loadZoomLevels(widgets: QueryRelatedWidget[]) {
    const zoomNodes = [
      [
        new ZoomLevelNode('to_year', DateFunctionTypes.year),
        new ZoomLevelNode('to_quarter', DateFunctionTypes.quarterOfYear),
        new ZoomLevelNode('to_month', DateFunctionTypes.monthOfYear),
        new ZoomLevelNode('to_week', DateFunctionTypes.weekOfMonth),
        new ZoomLevelNode('to_day_of_year', DateFunctionTypes.dayOfYear),
        new ZoomLevelNode('to_day_of_month', DateFunctionTypes.dayOfMonth),
        new ZoomLevelNode('to_day_of_week', DateFunctionTypes.dayOfWeek)
      ],
      [
        new ZoomLevelNode('to_year_num', DateFunctionTypes.yearlyOf),
        new ZoomLevelNode('to_quarter_num', DateFunctionTypes.quarterOf),
        new ZoomLevelNode('to_month_num', DateFunctionTypes.monthOf),
        new ZoomLevelNode('to_week_num', DateFunctionTypes.weekOf),
        new ZoomLevelNode('to_day_num', DateFunctionTypes.dayOf)
      ]
    ];
    this.zoomNodes = [];
    this.zoomNodes.push(...zoomNodes);
    this.zoomLevelsAsMap.clear();
    this.zoomNodes.forEach((hierarchy, index) => {
      hierarchy.forEach(item => {
        this.zoomLevelsAsMap.set(item.level, index);
      });
    });
  }

  @Mutation
  zoomChart(payload: { chart: ChartInfo; nextLvl: string }): void {
    const { chart, nextLvl } = payload;
    const currentZoom: ZoomData | undefined = this.zoomDataAsMap.get(chart?.id);
    if (currentZoom && Zoomable.isZoomable(chart.setting)) {
      const zoomData = chart.setting.buildNewZoomData(currentZoom, nextLvl);
      currentZoom.setHorizontalLevel(zoomData.currentHorizontalLevel ?? '');
    }
  }

  @Mutation
  reset() {
    this.zoomNodes = [];
    this.zoomLevelsAsMap.clear();
    this.zoomDataAsMap.clear();
  }

  get zoomLevelData(): { levels: string[][]; levelsAsMap: Map<string, number> } {
    return {
      levels: this.zoomNodes.map(node => node.map(item => item.level)),
      levelsAsMap: this.zoomLevelsAsMap
    };
  }

  get canZoom(): (id: WidgetId) => boolean {
    return (id: WidgetId) => {
      return !!this.zoomDataAsMap.get(id)?.currentHorizontalLevel;
    };
  }
}

export const ZoomModule = getModule(ZoomStore);

export function getZoomNode(level: string): ZoomLevelNode[] {
  const nodeIndex: number = ZoomModule.zoomLevelsAsMap.get(level) ?? -1;
  return nodeIndex == -1 ? [] : ZoomModule.zoomNodes[nodeIndex];
}
