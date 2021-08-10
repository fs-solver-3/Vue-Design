/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:14 PM
 */

import { ConditionType } from '@core/domain/Model';
import { Condition } from '@core/domain/Model/Condition/Condition';

export class Or extends Condition {
  className = ConditionType.Or;
  conditions: Condition[];

  constructor(conditions: Condition[]) {
    super();
    this.conditions = conditions;
  }

  static fromObject(obj: Or): Or {
    const conditions: Condition[] = obj.conditions?.map(o => Condition.fromObject(o)) || [];
    return new Or(conditions);
  }
}
