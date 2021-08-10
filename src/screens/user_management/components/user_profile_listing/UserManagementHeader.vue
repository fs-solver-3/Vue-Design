<template>
  <div class="user-header-container">
    <div class="user-header-title">
      <div class="regular-icon-16">
        <img alt="User profile" src="@/assets/icon/ic-16-userprofile.svg" />
      </div>
      <span align="center" class="regular-text-24">User Management</span>
    </div>
    <div class="user-header-actions">
      <DiButton v-if="isViewLoginSetting" :id="genBtnId('login-methods-setting')" class="col-auto" title="Login Methods" @click="toggleLoginSettingsModal">
        <img src="@/assets/icon/ic_setting.svg" />
      </DiButton>
      <DiButton :id="genBtnId('add-new-user')" class="col-auto" title="New user" @click="handleOnClickNewUser">
        <img alt="New user" class="icon-title" src="@/assets/icon/ic_add.svg" />
      </DiButton>
    </div>
    <AddNewUserModal ref="addNewUserModal"></AddNewUserModal>
    <LoginSettingsModal ref="loginSettingsModal"></LoginSettingsModal>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator';
import AddNewUserModal from '@/screens/user_management/components/user_profile_listing/AddNewUserModal.vue';
import DiButton from '@/shared/components/DiButton.vue';
import LoginSettingsModal from '@/screens/user_management/components/user_profile_listing/LoginSettingsModal.vue';
import { PermissionHandlerModule } from '@/store/modules/permission_handler.store';
import { Log } from '@core/utils';

@Component({
  components: { DiButton, AddNewUserModal, LoginSettingsModal }
})
export default class UserManagementHeader extends Vue {
  private isViewLoginSetting = false;

  @Ref()
  private addNewUserModal!: AddNewUserModal;

  @Ref()
  private loginSettingsModal!: LoginSettingsModal;

  private handleOnClickNewUser() {
    this.addNewUserModal.show();
  }

  private toggleLoginSettingsModal() {
    this.loginSettingsModal.show();
  }

  async created() {
    await this.GetIsPermittedViewLoginSetting();
    Log.debug('UserManagementHeader::created::isViewLoginSetting::', this.isViewLoginSetting);
  }

  async GetIsPermittedViewLoginSetting() {
    this.isViewLoginSetting = await PermissionHandlerModule.checkPermittedViewLoginSetting();
  }
}
</script>
<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';
::v-deep {
  .icon-title {
    height: 16px;
    width: 16px;
  }
}

.user-header-container {
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
  @media (max-width: 582px) {
    padding-bottom: 64px;
  }
}

.user-header-title {
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-grow: 2;
  justify-content: flex-start;
  order: 0;
}

.user-header-actions {
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  order: 1;
  @media (max-width: 583px) {
    margin-left: auto !important;
  }
}

.gg-login-checkbox {
  @include regular-text-14();
  opacity: 0.8;
  font-weight: 500;
}
</style>
