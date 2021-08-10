<template>
  <div ref="divContactForm" class="user-profile-details-contact">
    <StatusWidget v-if="isLoading || isError" :status="status"></StatusWidget>
    <div v-else-if="isLoaded">
      <div v-if="userFullDetailInfo" class="user-details-contact-header d-inline-flex flex-row">
        <div class="avatar">
          <img :src="userFullDetailInfo.profile.avatar || defaultAvatar" alt="Avatar" @error="$event.target.src = defaultAvatar" />
        </div>
        <div class="user-information d-inline-flex flex-column align-items-start">
          <span v-b-tooltip="userFullDetailInfo.profile.fullName" class="regular-text-24">{{ userFullDetailInfo.profile.fullName }}</span>
          <span v-b-tooltip="userFullDetailInfo.profile.email" class="regular-icon-16"> {{ userFullDetailInfo.profile.email }}</span>
          <span v-if="isActive" :class="{ active: isActive }" class="regular-icon-16"> Active </span>
          <span v-else :class="{ isNotActive: !isActive }" class="regular-icon-16"> Suspended </span>
          <!--        <span class="regular-icon-16 opacity-0dot5"> Last sign in: {{ timeActiveAgo }} </span>-->
          <span class="regular-icon-16 opacity-0dot5"> Created: {{ createdAtFormatted }} </span>
        </div>
      </div>
      <div class="divider"></div>
      <div class="user-details-contact-details">
        <FadeTransition>
          <div class="d-flex align-items-center">
            <div class="contact-details-actions position-relative" @click="toggleContactDetailsFrom">
              <b-icon-chevron-up v-if="isShowContactDetailsForm" style="color: #9799ac" />
              <b-icon-chevron-down v-else style="color: #9799ac" />
              <span class="details-actions-text">About this contact</span>
            </div>
            <DiButton :id="genBtnId('add-new-field')" title="Add field" class="add-new-field-btn ml-auto" @click="handleAddNewField">
              <img src="@/assets/icon/ic_add.svg" />
            </DiButton>
          </div>
        </FadeTransition>
        <CollapseTransition>
          <div v-show="isShowContactDetailsForm" class="contact-details-form">
            <ContactDetailsForm v-if="userFullDetailInfo" :maxSpanWidth="maxSpanWidth" />
          </div>
        </CollapseTransition>
        <!--   todo handle disable if dont have enough permission-->
        <div class="d-flex flex-column">
          <b-button v-if="isActive" :id="genBtnId('suspend-user')" class="mr-auto align-items-center d-flex admin-btn" @click="handleSuspendUser">
            <img src="@/assets/icon/ic_suspend_user.svg" />
            <div class="font-weight-bold">Suspend User</div>
          </b-button>
          <b-button v-else :id="genBtnId('active-user')" class="mr-auto align-items-center d-flex admin-btn" @click="handleActiveUser">
            <img src="@/assets/icon/ic_suspend_user.svg" />
            <div class="font-weight-bold">Unsuspend User</div>
          </b-button>
          <b-button :id="genBtnId('restore-data')" class="mr-auto align-items-center d-none admin-btn">
            <img src="@/assets/icon/ic_restore_data.svg" />
            <div class="font-weight-bold">Restore Data</div>
          </b-button>
          <b-button :id="genBtnId('delete-user')" class="mr-auto align-items-center d-flex admin-btn" @click="handleDeleteUserButtonClicked">
            <img src="@/assets/icon/ic_delete.svg" />
            <div class="font-weight-bold">Delete User</div>
          </b-button>
        </div>
      </div>
    </div>

    <AddNewFieldModal ref="addNewFieldModal"></AddNewFieldModal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import { CollapseTransition, FadeTransition } from 'vue2-transitions';
import DiButton from '@/shared/components/DiButton.vue';
import AddNewFieldModal from '@/screens/user_management/components/user_profile_details/AddNewFieldModal.vue';
import moment from 'moment';
import { UserFullDetailInfo } from '@core/domain/Model';
import ContactDetailsForm from '@/screens/user_management/components/user_profile_details/ContactDetailsForm.vue';
import { UserProfileDetailModule } from '@/screens/user_management/store/user_profile_detail.store';
import { UserDetailPanelType } from '@/screens/user_management/store/enum';
import { PopupUtils } from '@/utils/popup.utils';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { Status } from '@/shared';
import { Log } from '@core/utils';

@Component({
  components: {
    StatusWidget,
    AddNewFieldModal,
    DiButton,
    CollapseTransition,
    FadeTransition,
    ContactDetailsForm
  }
})
export default class UserContact extends Vue {
  private isShowContactDetailsForm: boolean;
  private defaultAvatar: string;
  private maxSpanWidth: number;

  @Prop()
  private status!: Status;

  // @Prop()
  // private userFullDetailInfo?: UserFullDetailInfo;
  private get userFullDetailInfo(): UserFullDetailInfo | null {
    return UserProfileDetailModule.userFullDetailInfo;
  }

  @Ref()
  private divContactForm!: any;

  @Ref()
  addNewFieldModal!: AddNewFieldModal;

  constructor() {
    super();
    this.isShowContactDetailsForm = true;
    this.defaultAvatar = require('@/assets/icon/default-avatar.svg');
    this.maxSpanWidth = 200;
  }

  private get isLoaded() {
    return this.status === Status.Loaded;
  }
  private get isError() {
    return this.status === Status.Error;
  }
  private get isLoading() {
    Log.debug('isLoading::', this.status);
    return this.status === Status.Loading;
  }

  private get isActive(): boolean {
    // TODO: get active
    return this.userFullDetailInfo?.user?.isActive ?? false;
  }

  private get timeActiveAgo(): string {
    // TODO: get time active as Ago
    return 'A minute ago';
  }

  private get createdAtFormatted(): string {
    // TODO: get time created
    const format = 'MMM, DD YYYY HH:mm:ss';
    return moment(this.userFullDetailInfo?.profile?.createdTime).format(format);
  }

  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
      this.onResize();
    });
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  }

  toggleContactDetailsFrom() {
    this.isShowContactDetailsForm = !this.isShowContactDetailsForm;
  }

  private onResize() {
    const { width } = this.divContactForm.getBoundingClientRect();
    this.maxSpanWidth = width - 100;
  }

  private handleAddNewField() {
    Log.debug('Contact::handleAddNewField::click');
    this.addNewFieldModal.show();
  }

  private async handleSuspendUser() {
    //Todo SuspendUser
    await UserProfileDetailModule.deactivateUser()
      .then(() => {
        PopupUtils.showSuccess(`User ${this.userFullDetailInfo?.profile?.fullName} is deactivated successfully.`);
      })
      .catch(err => {
        PopupUtils.showError(err.message);
        Log.debug('UserManagementProfileStore::activeUser::err::', err.message);
      });
  }

  private async handleActiveUser() {
    await UserProfileDetailModule.activateUser()
      .then(() => {
        PopupUtils.showSuccess(`User ${this.userFullDetailInfo?.profile?.fullName} is activated successfully.`);
      })
      .catch(err => {
        PopupUtils.showError(err.message);
        Log.debug('Contact::activeUser::err::', err.message);
      });
  }

  private async handleDeleteUserButtonClicked() {
    const panelType = UserProfileDetailModule.currentDetailPanelType;
    if (panelType !== UserDetailPanelType.UserDeletion) await UserProfileDetailModule.switchDetailPanelType(UserDetailPanelType.UserDeletion);
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~bootstrap/scss/bootstrap-grid';

.user-profile-details-contact {
  background-color: var(--user-profile-background-color);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 400px;

  @media all and (max-width: 880px) {
    flex-grow: 2;
  }

  .user-details-contact-header {
    order: 0;
    padding: 24px;

    .avatar {
      height: 100px;
      width: 100px;

      img {
        border-radius: 50%;
        box-sizing: content-box;
        height: 100%;
        object-fit: contain;
        width: 100%;
      }
    }

    .user-information {
      margin-left: 16px;

      overflow: hidden;
      text-overflow: ellipsis;

      span {
        margin-left: 0;
        margin-top: 8px;
        padding: 0;
        text-overflow: ellipsis;

        &.active {
          color: var(--success);
        }

        &.isNotActive {
          color: var(--danger);
          //opacity: 0.5;
        }
      }
    }
  }

  .divider {
    background-color: var(--white);
    height: 1px;
    margin: 0 24px;
    opacity: 0.1;
  }

  .user-details-contact-details {
    display: flex;
    flex-direction: column;
    padding: 24px;

    .contact-details-actions {
      display: flex;
      flex-direction: row;
      height: 30px;
      width: 100%;

      svg {
        align-self: center;
      }

      .details-actions-text {
        @include regular-text;
        align-self: center;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.6px;
        margin-left: 8px;
      }
    }

    .add-new-field-btn {
      @include regular-text;
      font-size: 14px;
    }

    .contact-details-actions:hover {
      background-color: var(--primary);
      border-radius: 4px;
      cursor: pointer;

      span:hover {
        cursor: pointer;
      }
    }

    .contact-details-form {
      margin-top: 32px;
    }

    .admin-btn {
      letter-spacing: 0.6px;
      font-size: 14px;
      font-weight: 600;

      img {
        margin-right: 8px;
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>
