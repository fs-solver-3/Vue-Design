/*
 * @author: tvc12 - Thien Vi
 * @created: 5/27/21, 11:33 AM
 */

import { VisualizationResponse, VizResponseType } from './VisualizationResponse';
import { CompareMode } from '@core/domain/Request/Query/CompareMode';
import { startCase } from 'lodash';
import { ListUtils } from '@/utils';

export class SeriesOneItem {
  [key: string]: any;

  constructor(public name: string, public data: any[], public yAxis: number, public stack?: string) {}

  static fromObject(object: SeriesOneItem): SeriesOneItem {
    return new SeriesOneItem(object.name, object.data, object.yAxis, object.stack);
  }
}

export class SeriesOneResponse implements VisualizationResponse {
  className: VizResponseType = VizResponseType.SeriesOneResponse;

  constructor(
    public readonly series: SeriesOneItem[],
    public readonly xAxis?: any[],
    public readonly yAxis?: any[],
    public readonly compareResponses?: Map<CompareMode, SeriesOneResponse>
  ) {}

  static empty(): SeriesOneResponse {
    return new SeriesOneResponse([], [], []);
  }

  static fromObject(obj: SeriesOneResponse): SeriesOneResponse {
    const series = obj.series?.map(item => SeriesOneItem.fromObject(item)) || [];
    if (obj.compareResponses) {
      const compareResponseAsMap = this.fromObjectToCompareResponse(obj.compareResponses);
      return new SeriesOneResponse(series, obj.xAxis, obj.yAxis, compareResponseAsMap);
    } else {
      return new SeriesOneResponse(series, obj.xAxis, obj.yAxis);
    }
  }

  private static fromObjectToCompareResponse(compareResponses: any): Map<CompareMode, SeriesOneResponse> {
    if (compareResponses instanceof Map) {
      return new Map<CompareMode, SeriesOneResponse>(compareResponses.entries());
    } else {
      const entries: [CompareMode, SeriesOneResponse][] = Object.entries(compareResponses).map(([key, value]) => {
        const keyAsPascalCase = startCase(key).replace(/\s+/, '');
        return [keyAsPascalCase as CompareMode, SeriesOneResponse.fromObject(value as SeriesOneResponse)];
      });
      return new Map<CompareMode, SeriesOneResponse>(entries);
    }
  }

  haveComparison(): boolean {
    return this.compareResponses != undefined && this.compareResponses.size > 0;
  }

  hasData(): boolean {
    const itemHaveData: SeriesOneItem | undefined = this.series.find(item => ListUtils.isNotEmpty(item.data));
    return itemHaveData != undefined;
  }
}
