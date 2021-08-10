import { DiTableHeader } from '@/shared/models';
import { TableSettingClass } from '@/shared';

export enum UserDetailPanelType {
  UserPrivilege,
  UserDeletion
}

export const PROFILE_LISTING_HEADERS = [
  new DiTableHeader({
    key: 'username',
    label: 'Username',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'email',
    label: 'Email',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'fullName',
    label: 'Name',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'firstName',
    label: 'First Name',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'lastName',
    label: 'Last Name',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'isActive',
    label: 'Status',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'createdTime',
    label: 'Created Time',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'mobilePhone',
    label: 'Mobile Phone',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'gender',
    label: 'Gender',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'dob',
    label: 'Date of Birth',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'avatar',
    label: 'Avatar',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  }),
  new DiTableHeader({
    key: 'updatedTime',
    label: 'Updated Time',
    tdClass: TableSettingClass.tdProfileTextLeftClass,
    isTextLeft: true
  })
];
