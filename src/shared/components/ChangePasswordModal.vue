<template>
  <BModal
    id="change-password-modal"
    ref="modal"
    centered
    cancel-title="Cancel"
    ok-title="Confirm"
    :hide-header="true"
    @ok="handleChangePassword"
    @hide="onHideModal"
  >
    <div class="change-password-modal-body">
      <div class="modal-title mar-left-16">Change Password</div>
      <InputPass
        :id="genInputId('current-password')"
        class="input-pass"
        label="CURRENT PASSWORD"
        placeholder="Current password"
        @onPasswordChanged="handleCurrentPasswordChange"
      />
      <div v-if="$v.currentPassword.$error" class="text-danger mar-left-16">
        <div v-if="!$v.currentPassword.required">Current password is required</div>
        <div v-else-if="!$v.currentPassword.minLength">Current password must at least 6 characters</div>
      </div>
      <InputPass
        :id="genInputId('new-password')"
        class="input-pass"
        label="NEW PASSWORD"
        placeholder="New password"
        @onPasswordChanged="handleNewPasswordChange"
      />
      <div v-if="$v.newPassword.$error" class="text-danger mar-left-16">
        <div v-if="!$v.newPassword.required">New password is required</div>
        <div v-if="!$v.newPassword.minLength">New password must at least 6 characters</div>
        <div v-if="!$v.newPassword.notSameCurrentPassword">New password can not be the same as current password</div>
      </div>
      <InputPass
        :id="genInputId('confirm-password')"
        class="input-pass"
        label="CONFIRM NEW PASSWORD"
        placeholder="Confirm new password"
        @onPasswordChanged="handleConfirmPasswordChange"
      />
      <div v-if="$v.confirmPassword.$error" class="text-danger mar-left-16">
        <div v-if="!$v.confirmPassword.required">Confirm password is required.</div>
        <div v-else-if="!$v.confirmPassword.sameAsPassword">Confirm password does not match.</div>
      </div>
    </div>
  </BModal>
</template>
<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import DiCustomModal from './DiCustomModal.vue';
import DiCustomCenterModal from '@/screens/DataIngestion/components/DiCustomCenterModal.vue';
import InputPass from '@/screens/Login/components/InputComponents/InputPass.vue';
import { minLength, required, sameAs } from 'vuelidate/lib/validators';
import { Log } from '@core/utils';
import { AuthenticationModule } from '@/store/modules/authentication.store';
import { PopupUtils } from '@/utils/popup.utils';
import { AtomicAction } from '@/shared/anotation/AtomicAction';
import { KeyboardUtils } from '@/utils/KeyboardUtils';

@Component({
  components: { InputPass, DiCustomCenterModal, DiCustomModal },
  validations: {
    currentPassword: { required, minLength: minLength(6) },
    newPassword: {
      required,
      minLength: minLength(6),
      notSameCurrentPassword(val, { currentPassword }) {
        return val !== currentPassword;
      }
    },
    confirmPassword: { required, sameAsPassword: sameAs('newPassword') }
  }
})
export default class ChangePasswordModal extends Vue {
  private currentPassword = '';
  private newPassword = '';
  private confirmPassword = '';

  @Ref()
  modal?: DiCustomModal;

  show() {
    this.initModal();
    window.addEventListener('keydown', this.handleCatchKeydown);
    this.modal?.show();
  }

  async handleCatchKeydown(event: Event) {
    try {
      //@ts-ignore
      const keyCode = event.keyCode;
      if (KeyboardUtils.isEnterKeyCode(keyCode)) {
        await this.changePassword();
      }
    } catch (e) {
      Log.error('ChangePasswordModal::handleCatchKeydown::error::', e.message);
    }
  }

  hide() {
    this.modal?.hide();
  }

  onHideModal() {
    Log.debug('removeKeyEvent');
    window.removeEventListener('keydown', this.handleCatchKeydown);
  }

  private handleCurrentPasswordChange(newValue: string) {
    try {
      this.currentPassword = newValue;
    } catch (e) {
      Log.error('ChangePasswordModal::handleCurrentPasswordChange::error::', e.message);
    }
  }

  private handleNewPasswordChange(newValue: string) {
    try {
      this.newPassword = newValue;
    } catch (e) {
      Log.error('ChangePasswordModal::handleNewPasswordChange::error::', e.message);
    }
  }

  private handleConfirmPasswordChange(newValue: string) {
    try {
      this.confirmPassword = newValue;
    } catch (e) {
      Log.error('ChangePasswordModal::handleConfirmPasswordChange::error::', e.message);
    }
  }

  private async handleChangePassword(event: Event) {
    try {
      this.preventHideModal(event);
      await this.changePassword();
    } catch (e) {
      PopupUtils.showError(e.message);
      Log.error('ChangePasswordModal::handleSubmitModal::error::', e.message);
    }
  }

  private preventHideModal(event: Event) {
    event.preventDefault();
  }

  @AtomicAction()
  private async changePassword() {
    if (this.isValidForm()) {
      const isChangedPasswordSuccess = await AuthenticationModule.changePassword({ oldPass: this.currentPassword, newPass: this.newPassword });
      if (isChangedPasswordSuccess) {
        this.hide();
      } else {
        PopupUtils.showError("Can't change password.");
      }
    }
  }

  private isValidForm() {
    this.$v.$touch();
    if (this.$v.$invalid) {
      return false;
    }
    return true;
  }

  @Watch('currentPassword')
  resetCurrentPasswordInputError() {
    try {
      this.$v.currentPassword?.$reset();
    } catch (e) {
      Log.error('ChangePasswordModal::resetCurrentPasswordInputError::error', e.message);
    }
  }

  @Watch('newPassword')
  resetNewPasswordInputError() {
    try {
      this.$v.newPassword?.$reset();
    } catch (e) {
      Log.error('ChangePasswordModal::resetNewPasswordInputError::error', e.message);
    }
  }

  @Watch('confirmPassword')
  resetConfirmPasswordInputError() {
    try {
      this.$v.confirmPassword?.$reset();
    } catch (e) {
      Log.error('ChangePasswordModal::resetNewPasswordInputError::error', e.message);
    }
  }

  initModal() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.$v.$reset();
  }
}
</script>
<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';
.change-password-modal-body {
  .mar-left-16 {
    margin-left: 16px;
  }

  .modal-title {
    @include regular-text();
    font-size: 24px;
    //margin-bottom: 16px;
  }

  .input-pass {
    width: 384px;

    ::v-deep {
      max-height: 66px;
      background: none;
      margin-bottom: 0;
      //  margin-top: 24px !important;
      .show-pass {
        bottom: 10px;
      }
    }
  }
}

::v-deep {
  .modal-dialog {
    max-width: 448px;
  }
  .modal-footer {
    width: 384px;
    padding-left: 0;
    padding-right: 0;
    @media (max-width: 500px) {
      width: 100%;
    }
    display: flex;
    margin: auto;
    button {
      flex-basis: 0;
      flex-grow: 1;
      max-width: 100%;
      height: 42px;
    }
  }
}
</style>
