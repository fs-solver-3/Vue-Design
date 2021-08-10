/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:13 PM
 */

import { ConditionType } from '@core/domain/Model';
import { Condition } from '@core/domain/Model/Condition/Condition';

export class And extends Condition {
  className = ConditionType.And;
  conditions: Condition[];

  constructor(conditions: Condition[]) {
    super();
    this.conditions = conditions;
  }

  static fromObject(obj: And): And {
    const conditions: Condition[] = obj.conditions?.map(o => Condition.fromObject(o)) ?? [];
    return new And(conditions);
  }
}
