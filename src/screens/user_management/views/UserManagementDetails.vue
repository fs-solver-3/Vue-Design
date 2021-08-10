<template>
  <div class="d-flex flex-column h-100 w-100">
    <template>
      <transition name="header-fade" mode="out-in">
        <HeaderBar :showLogout="true" />
      </transition>
    </template>
    <div class="user-profile-details-container">
      <div class="user-profile-details-header">
        <router-link to="/user-management">
          <div class="regular-icon-16 btn-ghost">
            <img src="@/assets/icon/ic-16-arrow-left.svg" alt="Back to User Profile" />
          </div>
        </router-link>
        <span class="regular-text-24">{{ fullName }}</span>
      </div>
      <MessageContainer v-if="isError" :message="errorMessage"></MessageContainer>
      <div v-if="!isError" class="user-profile-details-body">
        <Contact :status="userContactStatus" :user-full-detail-info="userFullDetailInfo" />
        <UserPrivilege
          v-if="isUserPrivilegeOpened"
          :errorMessage="privilegeErrorMessage"
          :permissionGroups="transformData(permissionGroups)"
          :permissions="selectedPermissions"
          :fullName="fullName"
          :status="userPrivilegeStatus"
        />
        <UserDeletion v-else-if="isUserDeletionOpened" :fullName="fullName"></UserDeletion>
      </div>
    </div>
    <div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';
import NProgress from 'nprogress';
import { FadeTransition } from 'vue2-transitions';

import Contact from '@/screens/user_management/components/user_profile_details/Contact.vue';
import { CheckboxGroupOption, GroupCheckboxOption, Routers, Status } from '@/shared';
import UserPrivilege from '@/screens/user_management/components/user_profile_details/UserPrivilege.vue';
import UserDeletion from '@/screens/user_management/components/user_profile_details/UserDeletion.vue';
import { PermissionGroup, PermissionInfo } from '@core/admin/domain/permissions/PermissionGroup';
import { UserFullDetailInfo } from '@core/domain/Model';
import { UserProfileDetailModule } from '@/screens/user_management/store/user_profile_detail.store';
import { UserDetailPanelType } from '@/screens/user_management/store/enum';
import MessageContainer from '@/shared/components/MessageContainer.vue';
import { DIException } from '@core/domain/Exception';
import { Log } from '@core/utils';

NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

@Component({
  components: {
    MessageContainer,
    UserPrivilege,
    FadeTransition,
    Contact,
    UserDeletion
  }
})
export default class UserManagementDetails extends Vue {
  errorMessage = '';
  privilegeErrorMessage = '';
  userPrivilegeStatus = Status.Loading;
  userContactStatus = Status.Loading;

  get isError() {
    if (this.errorMessage === '') {
      return false;
    }
    return true;
  }

  private get isUserPrivilegeOpened() {
    return UserProfileDetailModule.currentDetailPanelType == UserDetailPanelType.UserPrivilege;
  }

  private get isUserDeletionOpened() {
    return UserProfileDetailModule.currentDetailPanelType == UserDetailPanelType.UserDeletion;
  }

  get fullName() {
    return this.userFullDetailInfo?.profile?.fullName ?? '';
  }

  private get permissionGroups(): PermissionGroup[] {
    return UserProfileDetailModule.permissionGroups;
  }

  private get userFullDetailInfo(): UserFullDetailInfo | null {
    return UserProfileDetailModule.userFullDetailInfo;
  }

  private get selectedPermissions(): string[] {
    return UserProfileDetailModule.selectedPermissions;
  }

  async beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext<any>) {
    //todo handle check permissions here
    try {
      NProgress.start();
      if (to.params.username) {
        UserProfileDetailModule.setSelectedUsername({ username: to.params.username });
      }

      next();
    } catch (e) {
      Log.error(`BeforeRouteEnter getting an error: ${e?.message}`);
      next({ name: Routers.notFound });
    } finally {
      NProgress.done();
    }
  }

  created() {
    this.initUserProfileDetail();
  }

  destroyed() {
    UserProfileDetailModule.reset();
  }

  //todo rename and move to new file
  transformData(permissionGroups: PermissionGroup[]): GroupCheckboxOption[] {
    const result = permissionGroups.map(group => {
      return {
        ...group,
        permissions: this.toCheckboxGroupOption(group.permissions)
      };
    });
    Log.debug('permission group::', result);
    return result;
  }

  toCheckboxGroupOption(permissions: PermissionInfo[]): CheckboxGroupOption[] {
    return permissions.map(per => {
      return {
        text: per.name,
        value: per.permission
      };
    });
  }

  private async initUserProfileDetail() {
    await Promise.all([
      await UserProfileDetailModule.loadUserFullDetailInfo()
        .then(() => {
          this.userContactStatus = Status.Loaded;
        })
        .catch(ex => {
          this.handleErrorLoadUserFullDetailInfo(ex);
          this.userPrivilegeStatus = Status.Error;
          this.userContactStatus = Status.Error;
          return Promise.reject();
        }),
      await UserProfileDetailModule.getSupportPermissionGroups(),
      await UserProfileDetailModule.loadSelectedPermissions()
        .then(() => {
          this.userPrivilegeStatus = Status.Loaded;
        })
        .catch(ex => {
          this.handleErrorLoadPermissions(ex);
          this.userPrivilegeStatus = Status.Error;
          return Promise.reject();
        })
    ]);
  }

  private handleErrorLoadUserFullDetailInfo(ex: DIException) {
    this.errorMessage = ex.message;
  }

  private handleErrorLoadPermissions(ex: DIException) {
    this.privilegeErrorMessage = ex.message;
    Log.debug('erorr::', this.privilegeErrorMessage);
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~bootstrap/scss/bootstrap-grid';

.user-profile-details-container {
  height: 100%;
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.user-profile-details-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.user-profile-details-body {
  display: flex;
  flex-direction: row;
  align-content: flex-start;
  padding-top: 16px;
  height: calc(100vh - 135px);
  width: 100%;

  @media all and (max-width: 880px) {
    flex-wrap: wrap;
    height: 100%;
  }
}
</style>

<style>
body {
  height: 100vh;
}
</style>
