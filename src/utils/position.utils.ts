import { ChartInfo, DIMap, Position, Widget } from '@core/domain/Model';
import { DefaultSize, SizeAsMap } from '@/shared';
import { DI } from '@core/modules';
import { cloneDeep } from 'lodash';
import { ObjectUtils } from '@core/utils/ObjectUtils';
import { Log } from '@core/utils';

export abstract class PositionUtils {
  static getWidth(position?: Position, defaultValue?: number): number {
    return position?.width || defaultValue || 2;
  }

  static getHeight(position?: Position, defaultValue?: number): number {
    return position?.height || defaultValue || 2;
  }

  static getColumn(position?: Position, defaultValue?: number): number {
    return position?.column || defaultValue || 0;
  }

  static getRow(position?: Position, defaultValue?: number): number {
    return position?.row || defaultValue || 0;
  }

  static getPosition(widget: Widget) {
    if (ChartInfo.isChartInfo(widget)) {
      const [width, height] = SizeAsMap.get(widget.setting.className) ?? DefaultSize;
      return new Position(-1, -1, width, height, 1);
    } else {
      return new Position(-1, -1, 4, 1, 1);
    }
  }

  static calculateZIndex(mapPosition: DIMap<Position>): DIMap<Position> {
    const min = this.getMinZIndex(mapPosition);
    const isRequiredCalculateZIndex = min > 0;
    if (isRequiredCalculateZIndex) {
      return this.reCalculateZIndex(mapPosition, min);
    } else {
      return cloneDeep(mapPosition);
    }
  }

  static getMaxZIndex(mapPosition: DIMap<Position>) {
    let maxIndex = 1;
    Object.keys(mapPosition).forEach(key => {
      const position = mapPosition[+key];
      maxIndex = Math.max(position.zIndex || 0, maxIndex);
    });
    return maxIndex;
  }

  static getMinZIndex(mapPosition: DIMap<Position>) {
    let minZIndex = ObjectUtils.getHead(mapPosition)?.zIndex || 1;
    Object.keys(mapPosition).forEach(key => {
      const position = mapPosition[+key];
      minZIndex = Math.min(position.zIndex || 0, minZIndex);
    });
    return minZIndex;
  }

  private static reCalculateZIndex(mapPosition: DIMap<Position>, min: number): DIMap<Position> {
    const clonedMapPosition = cloneDeep(mapPosition);
    Object.keys(clonedMapPosition).forEach(key => {
      const position = clonedMapPosition[+key];
      position.zIndex = position.zIndex - min;
    });
    return clonedMapPosition;
  }
}
