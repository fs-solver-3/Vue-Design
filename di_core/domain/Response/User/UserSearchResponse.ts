/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 11:10 PM
 */

import { UserFullDetailInfo } from '@core/domain';
import { PageResult } from '@core/domain/Response/PageResult';

export class UserSearchResponse extends PageResult<UserFullDetailInfo> {
  constructor(data: UserFullDetailInfo[], total: number) {
    super(data, total);
  }

  static fromObject(obj: any): UserSearchResponse {
    return new UserSearchResponse(obj.data, obj.total);
  }
}
