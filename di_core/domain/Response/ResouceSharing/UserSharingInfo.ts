/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 11:07 PM
 */

import { UserProfile } from '@core/domain/Model';

export interface UserSharingInfo {
  id: string;
  user: UserProfile;
  permissions: string[];
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  updatedBy?: string;
}
