/*
 * @author: tvc12 - Thien Vi
 * @created: 6/2/21, 11:11 AM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';

export enum ParliamentDisplayType {
  Parliament = 'parliament',
  Rectangle = 'rectangle',
  Circle = 'circle'
}

export interface ParliamentSettingData extends SeriesVizData {
  displayType?: ParliamentDisplayType;
  maxDataPoint?: number;
}

export class ParliamentVizSetting extends VizSetting<ParliamentSettingData> {
  static readonly DEFAULT_SETTING = {
    plotOptions: {
      item: {
        borderWidth: 0,
        borderColor: 'black',
        dataLabels: {
          borderWidth: 0,
          textOutline: '0px contrast',
          useHTML: true,
          style: {
            border: '0px transparent',
            borderColor: 'none',
            textShadow: false,
            outline: 'none'
          }
        }
      }
    }
  };
  private static readonly DEFAULT_MAX_DATA_POINT = 1500;
  readonly chartFamilyType = ChartFamilyType.Parliament;
  readonly className = VizSettingType.ParliamentSetting;

  constructor(options: ParliamentSettingData = {}) {
    super(options);
  }

  static fromObject(obj: any & ParliamentVizSetting): ParliamentVizSetting {
    return new ParliamentVizSetting(obj.options);
  }

  getDisplayType(): ParliamentDisplayType {
    return this.options.displayType ?? ParliamentDisplayType.Parliament;
  }

  getMaxDataPoint(): number {
    return this.options.maxDataPoint || ParliamentVizSetting.DEFAULT_MAX_DATA_POINT;
  }
}
