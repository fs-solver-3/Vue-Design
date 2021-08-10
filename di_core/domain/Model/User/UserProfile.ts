/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 10:23 PM
 */

import { UserGenders } from '@core/domain/Model';
import { TrackingProfile } from '@core/tracking/domain/tracking_profile';

export class UserProfile {
  username: string;
  alreadyConfirmed: boolean;
  fullName?: string;
  lastName?: string;
  firstName?: string;
  email?: string;
  mobilePhone?: string;
  gender?: number;
  dob?: number;
  avatar?: string;
  oauthType?: string;
  properties?: { [key: string]: string };
  updatedTime?: number;
  createdTime?: number;

  constructor(object: any) {
    this.username = object.username ?? '';
    this.alreadyConfirmed = object.alreadyConfirmed ?? false;
    this.fullName = object.fullName;
    this.lastName = object.lastName;
    this.firstName = object.firstName;
    this.email = object.email;
    this.mobilePhone = object.mobilePhone;
    this.gender = UserGenders.toGenderId(object.gender ?? UserGenders.Other);
    this.dob = object.dob;
    this.avatar = object.avatar;
    this.oauthType = object.oauthType;
    this.properties = object.properties;
    this.updatedTime = object.updatedTime;
    this.createdTime = object.createdTime;
  }

  static fromObject(object: any): UserProfile {
    return new UserProfile(object);
  }

  static toTrackingProfile(userProfile: UserProfile): TrackingProfile {
    return new TrackingProfile(
      userProfile.username ?? '',
      userProfile.fullName ?? '',
      userProfile.firstName ?? '',
      userProfile.lastName ?? '',
      userProfile.email ?? '',
      userProfile.dob ?? 0,
      userProfile.createdTime ?? 0,
      userProfile.updatedTime ?? 0,
      '',
      '',
      '',
      userProfile.mobilePhone ?? '',
      UserGenders.toDisplayName(userProfile.gender ?? UserGenders.Other),
      userProfile.avatar ?? '',
      userProfile.properties
    );
  }
}
