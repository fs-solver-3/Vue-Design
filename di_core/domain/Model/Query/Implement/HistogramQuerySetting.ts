/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/3/20, 10:38 AM
 */

import { Condition, Function, getFiltersAndSorts, HistogramVizSetting, OrderBy, QuerySettingType, TableColumn, VizSettingType } from '@core/domain/Model';
import { QuerySetting } from '../QuerySetting';
import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';

export class HistogramQuerySetting extends QuerySetting<HistogramVizSetting> {
  readonly className = QuerySettingType.Histogram;

  constructor(public value: TableColumn, filters: Condition[] = [], sorts: OrderBy[] = [], public binsNumber?: number, options: Record<string, any> = {}) {
    super(filters, sorts, options);
  }

  static fromObject(obj: HistogramQuerySetting): HistogramQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const value = TableColumn.fromObject(obj.value);
    return new HistogramQuerySetting(value, filters, sorts, obj.binsNumber, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.value.function];
  }

  changeBinsNumber(value: string | number | undefined) {
    if (value) {
      this.binsNumber = +value;
    }
  }

  setValueBySetting(setting: VizSetting) {
    const isHistogramSetting = setting.className == VizSettingType.HistogramSetting;
    if (isHistogramSetting) {
      const binsNumber = (setting as HistogramVizSetting).options.binNumber;
      this.changeBinsNumber(binsNumber);
    }
  }

  static isHistogramQuerySetting(obj: any): obj is HistogramQuerySetting {
    return obj.className === QuerySettingType.Histogram;
  }
}
