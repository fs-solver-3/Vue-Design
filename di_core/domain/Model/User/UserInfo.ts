/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 10:23 PM
 */

export class UserInfo {
  username!: string;
  roles!: number[];
  permissions?: string[];
  isActive!: boolean;
  createdTime!: number;

  constructor(object: any) {
    this.username = object.username ?? '';
    this.roles = object.roles ?? [];
    this.permissions = object.permissions ?? [];
    this.isActive = object.isActive;
    this.createdTime = object.createdTime;
  }

  static fromObject(object: any): UserInfo {
    return new UserInfo(object);
  }
}
