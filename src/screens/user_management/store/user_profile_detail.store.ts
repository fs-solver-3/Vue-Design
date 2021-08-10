import { UserFullDetailInfo, UserProfile } from '@core/domain/Model';
import { PermissionGroup } from '@core/admin/domain/permissions/PermissionGroup';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared';
import { Inject } from 'typescript-ioc';
import { UserAdminService } from '@core/admin/service/UserAdminService';
import { PermissionAdminService } from '@core/admin/service/PermissionAdminService';
import { DIException } from '@core/domain/Exception';
import { ChangePermissionRequest } from '@core/admin/domain/request/ChangePermissionRequest';
import { EditUserProfileRequest } from '@core/admin/domain/request/EditUserProfileRequest';
import { DeleteUserRequest, TransferUserDataConfig } from '@core/admin/domain/request/TransferUserDataConfig';
import { UserDetailPanelType } from '@/screens/user_management/store/enum';
import { Log } from '@core/utils';

export interface UserProfileDetailState {
  currentDetailPanelType: UserDetailPanelType;
  userFullDetailInfo: UserFullDetailInfo;
  selectedUsername: string;
  permissionGroups: PermissionGroup[];
  selectedPermissions: string[];
}

@Module({ namespaced: true, store: store, dynamic: true, name: Stores.userProfileDetailStore })
class UserProfileDetailStore extends VuexModule {
  currentDetailPanelType: UserProfileDetailState['currentDetailPanelType'] = UserDetailPanelType.UserPrivilege;
  userFullDetailInfo: UserProfileDetailState['userFullDetailInfo'] | null = null;
  selectedUsername: UserProfileDetailState['selectedUsername'] = '';
  permissionGroups: UserProfileDetailState['permissionGroups'] = [];
  selectedPermissions: UserProfileDetailState['selectedPermissions'] = []; // current selected permissions.

  @Inject
  private userManagementService!: UserAdminService;

  @Inject
  permissionAdminService!: PermissionAdminService;

  @Action({ rawError: true })
  loadUserFullDetailInfo(): Promise<void> {
    return this.userManagementService.getUserFullDetailInfo(this.selectedUsername).then(userFullDetailInfo => {
      this.setUserFullDetailInfo({ userFullDetailInfo });
    });
  }

  @Mutation
  switchDetailPanelType(panelType: UserDetailPanelType) {
    this.currentDetailPanelType = panelType;
  }

  @Mutation
  setUserFullDetailInfo(payload: { userFullDetailInfo: UserFullDetailInfo }) {
    this.userFullDetailInfo = payload.userFullDetailInfo;
  }

  @Action({ rawError: true })
  async getSupportPermissionGroups() {
    return await this.permissionAdminService
      .getSupportPermissionGroups()
      .then(resp => {
        this.setPermissionGroups({ groups: resp });
      })
      .catch(err => {
        const error = DIException.fromObject(err);
        Log.debug('UserManagementProfileStore::getSupportPermissionGroups::error::', error.message);
      });
  }

  @Mutation
  setPermissionGroups(payload: { groups: PermissionGroup[] }) {
    this.permissionGroups = payload.groups;
  }

  @Action({ rawError: true })
  async savePermissions() {
    const excludePermissions = await this.getExcludePermissions();
    const includedPermissions = await this.getIncludedPermissions();
    const username = this.userFullDetailInfo?.profile?.username ?? this.selectedUsername;
    const request = new ChangePermissionRequest(username, includedPermissions, excludePermissions);
    return await this.permissionAdminService.changePermissions(request).then(() => {
      this.loadSelectedPermissions();
    });
  }

  @Action
  getExcludePermissions(): Promise<string[]> {
    const result: string[] = [];
    this.permissionGroups.forEach(group => {
      result.push(...group.getExcludedPermissions(this.selectedPermissions));
    });
    return Promise.resolve(result);
  }

  @Action
  getIncludedPermissions(): Promise<string[]> {
    const result: string[] = [];
    this.permissionGroups.forEach(group => {
      result.push(...group.getIncludedPermissions(this.selectedPermissions));
    });
    return Promise.resolve(result);
  }

  @Action({ rawError: true })
  loadSelectedPermissions(): Promise<void> {
    const permissions = UserProfileDetailStore.getAllPermissionsFromGroups(this.permissionGroups);
    return this.permissionAdminService
      .getPermittedPermissions(this.selectedUsername, permissions)
      .then(resp => this.setSelectedPermissions({ newSelectedPermissions: resp }));
  }

  static getAllPermissionsFromGroups(permissionGroups: PermissionGroup[]): string[] {
    return permissionGroups?.flatMap(group => group.getAllPermissions()) ?? [];
  }

  @Action({ rawError: true })
  deleteCurrentUser(config?: TransferUserDataConfig): Promise<boolean> {
    if (this.selectedUsername) {
      const request = new DeleteUserRequest(this.selectedUsername, config);
      return this.userManagementService.delete(request).then(() => Promise.resolve(true));
    } else {
      return Promise.resolve(true);
    }
  }

  @Action({ rawError: true })
  deactivateUser() {
    return this.userManagementService.deactivate(this.selectedUsername).then(() => this.loadUserFullDetailInfo());
  }

  @Action({ rawError: true })
  activateUser(): Promise<void> {
    return this.userManagementService.activate(this.selectedUsername).then(() => this.loadUserFullDetailInfo());
  }

  @Action
  updateSelectedPermissions(selectedPermissions: string[]) {
    this.setSelectedPermissions({ newSelectedPermissions: selectedPermissions });
  }

  @Mutation
  setSelectedPermissions(payload: { newSelectedPermissions: string[] }) {
    this.selectedPermissions = payload.newSelectedPermissions;
  }

  @Action({ rawError: true })
  editUserProfile(newProfile: EditUserProfileRequest): Promise<void> {
    return this.userManagementService.editUserProfile(newProfile).then(resp => {
      this.setUserProfile({ userProfile: resp });
    });
  }

  @Mutation
  setUserProfile(payload: { userProfile: UserProfile }) {
    if (this.userFullDetailInfo) {
      this.userFullDetailInfo.profile = payload.userProfile;
    }
  }

  @Mutation
  setSelectedUsername(payload: { username: string }) {
    this.selectedUsername = payload.username;
  }

  @Mutation
  reset() {
    this.selectedPermissions = [];
    this.permissionGroups = [];
    this.userFullDetailInfo = null;
    this.currentDetailPanelType = UserDetailPanelType.UserPrivilege;
  }
}

export const UserProfileDetailModule = getModule(UserProfileDetailStore);
