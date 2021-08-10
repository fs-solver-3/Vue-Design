/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 11:07 PM
 */

import { UserProfile, UserSharingInfo } from '@core/domain';

export interface ResourceSharingInfo {
  owner: UserProfile;
  totalUserSharing: number;
  usersSharing: UserSharingInfo[];
}
