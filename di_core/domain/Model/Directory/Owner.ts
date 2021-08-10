/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 10:14 PM
 */

import { UserId } from '@core/domain/Model';

export class Owner {
  public id: UserId;
  public fullName: string;

  constructor(id: number, fullName: string) {
    this.id = id;
    this.fullName = fullName;
  }

  static fromObject(obj: Owner): Owner {
    return new Owner(obj.id, obj.fullName);
  }
}
