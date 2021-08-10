export interface UserProfileTableRow {
  0: string;
  username: string;
  fullName?: string;
  lastName?: string;
  firstName?: string;
  email?: string;
  mobilePhone?: string;
  gender?: string;
  dob?: string;
  avatar?: string;
  alreadyConfirmed?: boolean;
  // properties: { [key: string]: string },
  updatedTime: string;
  createdTime: string;
  isActive: string;
}
