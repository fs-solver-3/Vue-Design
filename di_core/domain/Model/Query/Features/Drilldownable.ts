/*
 * @author: tvc12 - Thien Vi
 * @created: 3/29/21, 7:30 PM
 */

import { FieldRelatedFunction, TableColumn } from '@core/domain/Model';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';

export class DrilldownData {
  constructor(public value: string, public toField: FieldRelatedFunction, public name: string) {}
}

export abstract class Drilldownable {
  static isDrilldownable(obj: any): obj is Drilldownable {
    return !!(obj.buildQueryDrilldown && obj.getColumnWillDrilldown);
  }

  abstract getColumnWillDrilldown(): TableColumn;

  abstract buildQueryDrilldown(drilldownData: DrilldownData): QuerySetting;
}
