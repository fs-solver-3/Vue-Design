<template>
  <div class="user-management-details-deletion text-left">
    <div class="user-management-details-deletion-header ">
      <span>Delete User</span>
      <div class="ml-auto d-flex">
        <b-button class="back-btn btn mr-2" @click="handleCancel">Cancel</b-button>
        <b-button class="delete-btn btn d-flex" @click="handleDeleteUser">
          <div v-if="isDeleteBtnLoading" class="spinner-container justify-content-center align-items-center">
            <BSpinner class="spinner"></BSpinner>
          </div>
          Delete
        </b-button>
      </div>
    </div>
    <div class="user-privileges-title">Before deleting this user, you may want to transfer their data to another owner, just in case.</div>
    <vuescroll class="scroll-left-area">
      <div class="user-deletion overflow-hidden">
        <div class="group-deletion">
          <b-form-radio class="radio unselectable" type="radio" id="one" :value="0" v-model="selectedOption">
            <div class="cursor-pointer">Transfer ownership of {{ fullName }}’s data to another user (for example, a manager)</div>
          </b-form-radio>
          <div :class="{ disabled: isTransferDataDisabled }" class="deletion-content">
            <b-input class="transferred-account col-md-6 col-lg-5 col-11" v-model="newOwnerEmail" placeholder="New owner’s email" />
            <div class="text">Select data to transfer:</div>
            <b-form-checkbox-group v-model="selectedOptionDetail" class="group-checkbox">
              <b-form-checkbox value="directory_dashboard_data" class="checkbox checkbox-parent" type="checkbox">
                <div class="opa-0-8">Directory & Dashboard Data</div>
              </b-form-checkbox>
            </b-form-checkbox-group>
          </div>
        </div>
        <div class="group-deletion">
          <b-form-radio class="radio unselectable" type="radio" id="two" :value="1" v-model="selectedOption">
            <div class="cursor-pointer">Dont’t transfer data</div>
          </b-form-radio>
          <div class="deletion-content opacity-0dot5 pb-4">
            Brand Accounts and their data will be transferred to a new owner.
          </div>
        </div>
      </div>
    </vuescroll>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import GroupListCheckbox from '@/screens/user_management/components/user_profile_details/GroupListCheckbox.vue';
import { UserProfileDetailModule } from '@/screens/user_management/store/user_profile_detail.store';
import { TransferUserDataConfig } from '@core/admin/domain/request/TransferUserDataConfig';
import { UserDetailPanelType } from '@/screens/user_management/store/enum';
import { PopupUtils } from '@/utils/popup.utils';
import { Log } from '@core/utils';

/**
 * TODO:
 */
@Component({
  components: {
    GroupListCheckbox
  }
})
export default class UserDeletion extends Vue {
  private newOwnerEmail = '';
  private selectedOption = 0;
  private selectedOptionDetail: string[] = ['directory_dashboard_data'];
  private isDeleteBtnLoading = false;

  @Prop()
  fullName!: string;

  get isTransferDataDisabled() {
    return this.selectedOption == 1;
  }

  @Watch('selectedOptionDetail')
  handleSelectSubOption(newSelectedOptionDetail: string[]) {
    Log.debug('UserDeletion::handleSelectSubOption::newSelectedOptionDetail', newSelectedOptionDetail);
    this.selectedOptionDetail = newSelectedOptionDetail;
  }

  private handleDeleteUser() {
    Log.debug('Privileges::handleSavePrivilege::selectedCheckboxItem', this.selectedOption);
    const transferUserDataConfig = this.buildTransferUserDataConfig();
    this.isDeleteBtnLoading = true;
    UserProfileDetailModule.deleteCurrentUser(transferUserDataConfig)
      .then(deleteStatus => {
        if (deleteStatus) {
          PopupUtils.showSuccess(`User ${this.fullName} is deleted successfully`);
          this.isDeleteBtnLoading = false;
          UserProfileDetailModule.reset();
          this.back();
        }
      })
      .catch(ex => {
        PopupUtils.showError(ex.message);
        this.isDeleteBtnLoading = false;
        return Promise.resolve(false);
      });
  }

  private buildTransferUserDataConfig(): TransferUserDataConfig | undefined {
    if (this.selectedOption == 0) {
      return new TransferUserDataConfig(this.newOwnerEmail, this.selectedOptionDetail.includes('directory_dashboard_data'));
    } else {
      return undefined;
    }
  }

  private back() {
    this.$router.back();
  }

  private async handleCancel() {
    await UserProfileDetailModule.switchDetailPanelType(UserDetailPanelType.UserPrivilege); // back to privilege
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

.opa-0-5 {
  opacity: 0.5;
}

.opa-0-8 {
  opacity: 0.8;
}

.user-management-details-deletion {
  display: flex;
  flex-direction: column;
  background-color: var(--user-profile-background-color);
  border-radius: 4px;
  margin-left: 24px;
  flex-grow: 2;
  padding: 24px;
  height: 100%;
  font-family: Barlow;
  color: var(--white);

  @media all and (max-width: 880px) {
    margin-left: 0px;
    margin-top: 24px;
  }

  .user-management-details-deletion-header {
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

    .btn {
      padding: 4px 8px 5px;
      border-radius: 4px;
      @include regular-text-14();
      color: var(--white);
    }

    .back-btn {
      background: var(--gray);
    }

    .delete-btn {
      background: var(--accent);
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

  .user-privileges-title {
    @include regular-text;
    font-size: 16px;
    padding: 12px 0 24px 0;
    text-align: left;
  }

  .user-deletion {
    @include regular-text();
    font-size: 16px;

    .group-deletion {
      background-color: var(--primary);
      margin-top: 16px;
      border-radius: 4px;
      padding-left: 16px;

      .radio {
        padding-top: 24px;
        padding-bottom: 24px;

        ::v-deep {
          background: none;

          .custom-control-label::after {
            //background-image: url('~@/assets/icon/ic-16-radio.svg');
            cursor: pointer;
            background: var(--primary);
            border: 1px var(--gray) solid;
            border-radius: 50%;
          }

          .custom-control-input:checked ~ .custom-control-label::after {
            background-image: url('~@/assets/icon/ic-16-radio-active.svg');
            background-size: cover;
            background-color: var(--primary);
            border: 0;
          }

          .custom-control-label {
            font-weight: bold;
            padding-left: 4px;
            letter-spacing: 0.27px;
          }
        }
      }

      .deletion-content {
        padding-left: 28px;

        .transferred-account {
          height: 34px;
          font-size: 12px;
        }

        .text {
          padding-top: 24px;
          padding-bottom: 16px;
        }

        .group-checkbox {
          display: flex;
          flex-direction: column;

          .checkbox {
            padding-top: 8px;
            padding-bottom: 8px;

            ::v-deep {
              .custom-control {
                margin: 16px 0px;
              }

              input[type='checkbox'],
              input[type='checkbox'] + label {
                cursor: pointer;
              }

              .custom-control:last-child {
                margin-bottom: 20px;
              }

              .custom-control-label::before {
                background-color: var(--primary) !important;
                border: 1px solid var(--neutral) !important;
                border-radius: 2px;
                box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
              }

              .custom-control-input:checked ~ .custom-control-label::after {
                border: 1px solid var(--accent) !important;
                border-radius: 2px;
                background-image: url('~@/assets/icon/ic-16-check.svg');
                background-size: cover;
              }

              .custom-control-input:checked ~ .custom-control-label::before {
                border: none !important;
              }

              .custom-control-label {
                letter-spacing: 0.27px !important;
              }
            }

            &:last-child {
              padding-bottom: 24px;
            }
          }

          .checkbox-sub {
            padding-left: 48px;
            padding-bottom: 16px;
          }
        }

        &.disabled {
          pointer-events: none;
          opacity: 0.5;
        }
      }
    }
  }
}
</style>
