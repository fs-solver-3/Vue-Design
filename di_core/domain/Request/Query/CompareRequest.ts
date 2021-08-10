/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 11:17 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/10/20, 5:03 PM
 */

import { FieldRelatedCondition } from '@core/domain/Model';
import { CompareMode } from '@core/domain/Request/Query/CompareMode';

export class CompareRequest {
  constructor(
    public readonly firstCondition: FieldRelatedCondition,
    public readonly secondCondition: FieldRelatedCondition,
    public readonly mode: CompareMode
  ) {}
}
