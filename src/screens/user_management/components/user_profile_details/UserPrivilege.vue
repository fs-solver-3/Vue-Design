<template>
  <div class="user-management-details-privilege text-left">
    <StatusWidget v-if="isLoading" :status="status"></StatusWidget>
    <MessageContainer :message="errorMessage"></MessageContainer>
    <div v-if="isLoaded" class="user-management-details-privilege-header ">
      <span>Privileges</span>
      <b-button class="save-btn ml-auto d-flex" @click="handleSavePrivilege">
        <div v-if="isSaveBtnLoading" class="spinner-container justify-content-center align-items-center">
          <BSpinner class="spinner"></BSpinner>
        </div>
        Save
      </b-button>
    </div>
    <div v-if="isLoaded" class="user-privileges-title">Here are the admin privileges assigned to {{ fullName }}</div>
    <div class="overflow-hidden">
      <vuescroll>
        <div v-if="isLoaded" class="user-privilege overflow-hidden">
          <div class="group-privilege" v-for="(group, index) in permissionGroups" :key="index">
            <GroupListCheckbox
              :id="genMultiSelectionId('group-list-checkbox', index)"
              :selected-items="permissions"
              :group="group"
              :is-show-all-checkbox="true"
              @handleChangeListCheckbox="handleChangeListCheckbox"
            ></GroupListCheckbox>
          </div>
        </div>
      </vuescroll>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MultiSelection from '@/shared/components/MultiSelection.vue';
import GroupListCheckbox from '@/screens/user_management/components/user_profile_details/GroupListCheckbox.vue';
import { UserProfileDetailModule } from '@/screens/user_management/store/user_profile_detail.store';
import MessageContainer from '@/shared/components/MessageContainer.vue';
import { PopupUtils } from '@/utils/popup.utils';
import { DIException } from '@core/domain/Exception';
import { Status } from '@/shared';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import DiButton from '@/shared/components/DiButton.vue';
import { Log } from '@core/utils';

@Component({
  components: {
    DiButton,
    StatusWidget,
    MessageContainer,
    GroupListCheckbox,
    MultiSelection
  },
  computed: {}
})
export default class UserPrivilege extends Vue {
  isSaveBtnLoading = false;

  @Prop()
  status!: Status;

  @Prop()
  fullName!: string;

  @Prop()
  permissionGroups!: {};

  @Prop()
  permissions!: string[];

  @Prop()
  errorMessage!: string;

  private get isLoaded() {
    return this.status === Status.Loaded;
  }

  private get isLoading() {
    Log.debug('isLoading::', this.status);
    return this.status === Status.Loading;
  }

  /**
   * TODO: User Management
   * TODO: - Rename this method to a a better name. Eg: handleCheckBoxItemChanged
   * TODO: - Handle logic: toggle between permission 'All' and others
   * @param selectedItems
   * @private
   */
  private handleChangeListCheckbox(selectedItems: string[]) {
    UserProfileDetailModule.updateSelectedPermissions(selectedItems);
  }

  private handleSavePrivilege() {
    //todo update store and call api to save new Privilege
    this.isSaveBtnLoading = true;
    UserProfileDetailModule.savePermissions()
      .then(() => {
        PopupUtils.showSuccess(`${this.fullName}'s permissions is updated successfully.`);
        this.isSaveBtnLoading = false;
      })
      .catch(err => {
        const exError = DIException.fromObject(err);
        PopupUtils.showError(exError.message);
        this.isSaveBtnLoading = false;
        Log.debug('UserManagementProfileStore::savePermissions::error::', exError.message);
      });
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

.user-management-details-privilege {
  display: flex;
  flex-direction: column;
  background-color: var(--user-profile-background-color);
  border-radius: 4px;
  margin-left: 24px;
  flex-grow: 2;
  padding: 24px;
  height: 100%;
  font-family: Barlow;

  @media all and (max-width: 880px) {
    margin-left: 0px;
    margin-top: 24px;
  }

  .user-management-details-privilege-header {
    order: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;

    span {
      order: 0;
      @include regular-text;
      font-size: 24px;
      line-height: 1.17;
      letter-spacing: 0.2px;
    }

    .save-btn {
      background: var(--accent);
      padding: 4px 8px 5px;
      width: 80px;
      border-radius: 4px;
      @include regular-text-14();
      color: var(--white);
      text-align: center !important;

      ::v-deep {
        justify-content: center;
        .title {
        }
      }
      .spinner-container {
        //width: 1px
        margin-right: 6px;
        .spinner {
          width: 16px;
          height: 16px;
          font-size: 11px;
        }
      }
    }
  }
}

.user-privileges-title {
  @include regular-text;
  font-size: 16px;
  padding: 12px 0 24px 0;
  text-align: left;
}

.error {
  padding-top: 10px;
}

.user-privilege {
  margin-bottom: 20px;
  .group-privilege {
    background: var(--primary);
    margin-top: 16px;
    border-radius: 4px;
  }
}
</style>
