<template>
  <div class="header-container">
    <div class="container-fluid h-100 w-100">
      <div class="header-content">
        <div id="btn-home" class="d-flex align-items-center" @click="toMyData">
          <img alt="logo" class="logo mr-2" src="@/assets/logo/logo.webp" />
        </div>
        <div class="menu d-flex">
          <div class="search-input">
            <SearchInput :hintText="'Search dashboard and chart'" />
          </div>
          <router-link v-if="isLogin" v-slot="{ href, navigate, isActive, isExactActive }" class="header-bar-item" to="/mydata">
            <a :href="href" :id="genBtnId('dashboards')" :class="{ 'btn-ghost-alter': !isExactActive || !isActive }" @click="navigate">
              <img v-if="isExactActive || isActive" alt="dashboards" class="ic-16 m-1" src="@/assets/icon/data_management/ic_dashboard_active.svg" />
              <img v-else alt="dashboards" class="normal ic-16 m-1" src="@/assets/icon/data_management/ic_dashboard.svg" />
              <span :class="{ active: isExactActive || isActive }">Dashboards</span>
            </a>
          </router-link>
          <router-link v-if="isLogin" v-slot="{ href, navigate, isActive, isExactActive }" class="header-bar-item" to="/data-management">
            <a :href="href" :id="genBtnId('data-management')" :class="{ 'btn-ghost-alter': !isActive }" @click="navigate">
              <img v-if="isExactActive || isActive" alt="data management" class="ic-16 m-1" src="@/assets/icon/data_management/ic_database_active.svg" />
              <img v-else alt="data management" class="normal ic-16 m-1" src="@/assets/icon/data_management/ic_database.svg" />
              <span :class="{ active: isExactActive || isActive }">Data Management</span>
            </a>
          </router-link>
          <router-link v-if="isLogin" v-slot="{ href, navigate, isActive, isExactActive }" class="header-bar-item" to="/data-ingestion">
            <a :href="href" :id="genBtnId('data-ingestion')" :class="{ 'btn-ghost-alter': !isActive }" @click="navigate">
              <img v-if="isExactActive || isActive" alt="data ingestion" class="ic-16 m-1" src="@/assets/icon/data_ingestion/ic_data_ingestion_active.svg" />
              <img v-else alt="data ingestion" class="normal ic-16 m-1" src="@/assets/icon/data_ingestion/ic_data_ingestion.svg" />
              <span :class="{ active: isExactActive || isActive }">Data Ingestion</span>
            </a>
          </router-link>
          <router-link v-if="isLogin" v-slot="{ href, navigate, isActive, isExactActive }" class="header-bar-item" to="/tracking-profile">
            <a :href="href" :id="genBtnId('customer')" :class="{ 'btn-ghost-alter': !isExactActive || !isActive }" @click="navigate">
              <img v-if="isExactActive || isActive" alt="user profile" class="ic-16" src="@/assets/icon/ic-360-degree-active.svg" />
              <img v-else alt="user profile" src="@/assets/icon/ic-360-degree.svg" class="normal" />
              <span :class="{ active: isExactActive || isActive }">Customer</span>
            </a>
          </router-link>
          <button v-if="isLogin" :id="genBtnId('settings')" class="header-bar-item btn-ghost-alter" @click="handleTogglePopover">
            <img src="@/assets/icon/ic-profile.svg" alt="profile" class="normal" />
            <div class="text">Settings</div>
          </button>
        </div>
      </div>
    </div>
    <b-popover :target="genBtnId('settings')" :show.sync="isShowSettingMenu" placement="bottomRight" custom-class="custom-popover" triggers="blur">
      <div class="popover-body">
        <button v-if="isPermittedViewUser" :id="genBtnId('user-management')" class="popover-item user-management" @click="handleNavigateUserManagement">
          User Management
        </button>
        <button v-if="isShowChangePasswordOption()" :id="genBtnId('change-password')" class="popover-item user-management" @click="handleChangePassword">
          Change Password
        </button>
        <button v-if="showLogout" :id="genBtnId('log-out')" class="popover-item log-out" @click="handleSignOut">
          Sign Out
        </button>
      </div>
    </b-popover>
    <ChangePasswordModal ref="changePasswordModal" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import { AuthenticationModule } from '@/store/modules/authentication.store';
import { OauthType, Routers } from '@/shared';
import DiButton from '@/shared/components/DiButton.vue';
import { PermissionHandlerModule } from '@/store/modules/permission_handler.store';
import { RouteUtils } from '@/utils/routes.utils';
import { Log } from '@core/utils';
import ChangePasswordModal from '@/shared/components/ChangePasswordModal.vue';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';

@Component({
  components: { ChangePasswordModal, DiButton }
})
export default class HeaderBar extends Vue {
  private isShowSettingMenu = false;
  private isPermittedViewUser = false;

  @Ref()
  changePasswordModal?: ChangePasswordModal;

  @Prop({
    type: String,
    default: 'container-fluid'
  })
  container?: string;

  @Prop({ type: Boolean, default: true })
  showLogout!: boolean;

  private get isLogin() {
    return RouteUtils.isLogin();
  }

  private isShowChangePasswordOption(): boolean {
    const dataManager = DI.get(DataManager);
    return dataManager.getLoginType() === OauthType.DEFAULT;
  }

  async created() {
    if (RouteUtils.isLogin()) {
      await this.getIsPermittedViewUser();
      Log.debug('HeaderBar::Created::isPermittedViewUser', this.isPermittedViewUser);
    }
  }

  async getIsPermittedViewUser() {
    this.isPermittedViewUser = await PermissionHandlerModule.checkPermittedViewUserPermission();
  }

  handleSignOut() {
    this.isShowSettingMenu = false;
    AuthenticationModule.logout();
  }

  private hideSettingMenu() {
    this.isShowSettingMenu = false;
  }

  private toMyData() {
    this.$router.push({ name: Routers.mydata });
  }

  private handleNavigateUserManagement() {
    this.hideSettingMenu();
    if (this.$router.currentRoute.name !== Routers.userManagement) {
      this.$router.push({ name: Routers.userManagement });
    }
  }

  private handleTogglePopover() {
    this.isShowSettingMenu = !this.isShowSettingMenu;
  }

  private handleChangePassword() {
    this.hideSettingMenu();
    this.changePasswordModal?.show();
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';

button {
  outline: none;
  background: none;
  border: none;
  border-radius: 4px;

  .text {
    opacity: 0.5;
  }
  &:hover {
    .text {
      opacity: 1;
    }
  }
}

.header-container {
  background-color: var(--secondary);
  height: 40px;
}

.header-content {
  height: 100%;
  align-items: center;
  display: flex;
  justify-content: space-between;

  .logo {
    cursor: pointer;
    height: 24px;
    object-fit: contain;
  }

  .menu {
    align-items: center;
    display: flex;

    .search-input {
      min-width: 208px;
      padding-left: 0;
      display: none;

      @include media-breakpoint-only(xs) {
        max-width: 78px;
        min-width: 78px;
      }

      ::v-deep {
        .form-control {
          min-height: 40px;
        }
      }
    }

    .header-bar-item {
      align-items: center;
      display: flex;
      padding: 0 10px;
      justify-content: center;
      border-radius: 4px;
      //opacity: 0.4;

      @include media-breakpoint-only(xs) {
        padding: 0 6px;
      }

      img {
        margin-right: 8px;
        @include media-breakpoint-only(xs) {
          margin-right: 2px;
        }

        &.normal {
          opacity: var(--normal-opacity);
        }
      }

      span {
        @include regular-text;
        color: var(--white);
        cursor: pointer;
        font-size: 14px;
        letter-spacing: 0.2px;
        opacity: var(--normal-opacity);
        padding-left: 6px;
        text-align: center;
        @include media-breakpoint-down(sm) {
          display: none;
        }
      }
      .text {
        @include media-breakpoint-down(sm) {
          display: none;
        }
      }

      &:hover {
        background: unset;

        img.normal {
          opacity: unset;
        }

        span {
          opacity: 1;
        }
      }
    }
  }
}

a:hover,
a:visited,
a:link,
a:active {
  text-decoration: none !important;
}

a:visited {
  outline: 0 !important;
}

.active {
  color: var(--accent) !important;
  opacity: 1 !important;
}

.custom-popover {
  background: none;
  border: none;
  max-width: unset;
  top: -10px !important;
  left: 20px !important;
  padding: 0 !important;
  margin-top: 0 !important;

  ::v-deep {
    .arrow {
      display: none;
    }
  }

  .popover-body {
    background: var(--primary);
    padding: 0 !important;
    height: auto;
    width: fit-content;
    border-radius: 4px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 4px 0 rgba(0, 0, 0, 0.16);

    .popover-item {
      display: flex;
      padding: 12px 16px;
      width: 100%;
      border-radius: 4px;
      cursor: pointer !important;

      @include regular-text-14();

      &:hover {
        background: #000000;
      }
    }
  }
}
</style>
