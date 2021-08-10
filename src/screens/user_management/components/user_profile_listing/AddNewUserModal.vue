<template>
  <DiCustomModal ref="customModal" ok-title="Add New User" size="md" title="Add New User" @onClickOk="handleClickOk">
    <div class="new-user-body d-flex flex-column align-items-center">
      <!--      <div class="circle-camera btn btn-ghost-alter">-->
      <!--        <img src="@/assets/icon/ic_camera.svg" />-->
      <!--      </div>-->
      <div class="input-box p-0 pt-4">
        <FormInput
          placeholder="First Name"
          :is-error="$v.newUserData.firstName.$error"
          :input-value="newUserData.firstName"
          @handleChangeInputValue="handleChangeFirstName"
        />
        <template v-if="$v.newUserData.firstName.$error">
          <div v-if="!$v.newUserData.firstName.required" class="error-text mr-auto warning">First Name is required</div>
        </template>
      </div>
      <div class="input-box p-0">
        <FormInput
          placeholder="Last Name"
          :is-error="$v.newUserData.lastName.$error"
          :input-value="newUserData.lastName"
          @handleChangeInputValue="handleChangeLastName"
        />
        <template v-if="$v.newUserData.lastName.$error">
          <div v-if="!$v.newUserData.lastName.required" class="error-text mr-auto warning">Last Name is required</div>
        </template>
      </div>
      <div class="input-box">
        <InputEmail
          :id="genInputId('email')"
          class="custom-input-email"
          :isError="$v.newUserData.email.$error"
          placeholder="Email"
          @onEmailChanged="handleChangeEmail"
        ></InputEmail>
        <template v-if="$v.newUserData.email.$error">
          <div v-if="!$v.newUserData.email.required" class="warning">Email is required</div>
          <div v-if="!$v.newUserData.email.email" class="warning">Invalid email</div>
        </template>
      </div>
      <div class="input-box">
        <InputPass
          :id="genInputId('password', 1)"
          class="custom-input-pass"
          :isError="$v.newUserData.password.$error"
          placeholder="Password"
          @onPasswordChanged="handleChangePassword"
        ></InputPass>
        <template v-if="$v.newUserData.password.$error">
          <div v-if="!$v.newUserData.password.required" class="warning">Password is required</div>
          <div v-if="!$v.newUserData.password.minLength" class="warning">Password must at least 6 characters</div>
        </template>
      </div>
      <div class="input-box">
        <InputPass
          :id="genInputId('password', 2)"
          class="custom-input-pass"
          :isError="$v.newUserData.confirmPassword.$error"
          placeholder="Confirm Password"
          @onPasswordChanged="handleChangeConfirmPassword"
        ></InputPass>
        <template v-if="$v.newUserData.confirmPassword.$error">
          <div v-if="!$v.newUserData.confirmPassword.required" class="warning">Confirm Password is required</div>
          <div v-else-if="!$v.newUserData.confirmPassword.sameAsPassword" class="warning">Confirm Password does not match</div>
        </template>
      </div>
      <div class="pt-3">
        <BSpinner v-if="isLoading" label="Spinning"></BSpinner>
        <pre v-if="isError" class="warning">{{ errorMessage }}</pre>
      </div>
    </div>
  </DiCustomModal>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import DiCustomModal from '@/shared/components/DiCustomModal.vue';
import InputPass from '@/screens/Login/components/InputComponents/InputPass.vue';
import InputEmail from '@/screens/Login/components/InputComponents/InputEmail.vue';
import FormInput from '@/screens/user_management/components/user_profile_listing/FormInput.vue';
import { CreateUserRequest } from '@core/admin/domain/request/CreateUserRequest';
import { email, minLength, required, sameAs } from 'vuelidate/lib/validators';
import { Routers, Status } from '@/shared';
import { DIException } from '@core/domain/Exception';
import { UserProfileListingModule } from '@/screens/user_management/store/user_profile_listing.store';
import { PopupUtils } from '@/utils/popup.utils';
import { Log } from '@core/utils';

export class NewUserData {
  constructor(public firstName: string, public lastName: string, public email: string, public password: string, public confirmPassword: string) {}

  static empty(): NewUserData {
    return new NewUserData('', '', '', '', '');
  }

  toCreateUserRequest(): CreateUserRequest {
    return new CreateUserRequest(this.email, this.password, `${this.firstName} ${this.lastName}`, this.firstName, this.lastName);
  }
}
//Todo refactor validate
@Component({
  components: { InputEmail, InputPass, DiCustomModal, FormInput },
  validations: {
    newUserData: {
      firstName: { required },
      lastName: { required },
      email: { required, email },
      password: { required, minLength: minLength(6) },
      confirmPassword: { required, sameAsPassword: sameAs('password') }
    }
  }
})
export default class AddNewUserModal extends Vue {
  private newUserData: NewUserData = NewUserData.empty();
  private errorMessage = '';

  private status = Status.Loaded;

  @Ref()
  private customModal!: DiCustomModal;

  show() {
    this.customModal.show();
    this.resetData();
  }

  hide() {
    this.customModal.hide();
    this.resetData();
  }

  private get isError() {
    return this.status === Status.Error;
  }

  private get isLoading() {
    return this.status === Status.Loading;
  }

  private handleClickOk(event: MouseEvent) {
    // prevent close modal
    event.preventDefault();
    if (this.isAddNewUser()) {
      this.status = Status.Loading;
      this.addNewUser(this.newUserData).then(status => {
        if (status) {
          this.hide();
        }
      });
    }
  }

  private isAddNewUser(): boolean {
    // TODO: validate here
    this.$v.$touch();
    if (this.$v.$invalid) {
      return false;
    }
    return true;
  }

  private async addNewUser(newUserData: NewUserData): Promise<boolean> {
    return UserProfileListingModule.createUser(newUserData.toCreateUserRequest())
      .then(resp => {
        UserProfileListingModule.setFrom({ from: 0 });
        UserProfileListingModule.loadUserProfileListing();
        this.status = Status.Loaded;
        this.$router.push({
          name: Routers.userManagementDetails,
          params: {
            username: resp.userProfile.username
          }
        });
        return true;
      })
      .catch(e => {
        const error = DIException.fromObject(e);
        Log.debug('Error Add new User::', error.message);
        this.errorMessage = error.message;
        this.status = Status.Error;
        return false;
      });
  }

  private resetData() {
    this.newUserData = NewUserData.empty();
    this.errorMessage = '';
    this.status = Status.Loaded;
    this.$v.$reset();
  }

  private handleChangePassword(newPassword: string, error: boolean) {
    this.newUserData.password = newPassword;
  }

  private handleChangeConfirmPassword(newConfirmPassword: string, error: boolean) {
    this.newUserData.confirmPassword = newConfirmPassword;
  }

  private handleChangeEmail(newEmail: string, error: boolean) {
    this.newUserData.email = newEmail;
  }

  private handleChangeFirstName(newFirstName: string) {
    this.newUserData.firstName = newFirstName;
  }

  private handleChangeLastName(newLastName: string) {
    this.newUserData.lastName = newLastName;
  }

  @Watch('newUserData.email')
  handleResetEmailError() {
    this.$v.newUserData.email?.$reset();
  }

  @Watch('newUserData.password')
  handleResetPasswordError() {
    this.$v.newUserData.password?.$reset();
  }

  @Watch('newUserData.confirmPassword')
  handleResetConfirmPasswordError() {
    this.$v.newUserData.confirmPassword?.$reset();
  }
}
</script>
<style lang="scss" scoped>
@import '~@/themes/scss/di-variables.scss';
@import '~@/themes/scss/mixin.scss';

.warning {
  color: var(--danger);
}
pre {
  white-space: pre-wrap;
  padding: 16px 24px 0 24px;
}

.error-text {
  padding: 0 24px;
}

.custom-input-email {
  ::v-deep {
    padding: 0;
    margin: 0 !important;
    opacity: 1;
    label {
      display: none;
    }
    input {
      width: 100%;
      min-height: 36px;
      background-color: #333646;
    }
    .email-span {
      display: none;
    }
  }
}

.custom-input-pass {
  ::v-deep {
    padding: 0;
    margin: 0;
    opacity: 1;
    label {
      display: none;
    }
    input {
      width: 100%;
      min-height: 36px;
      max-height: 36px;
      background-color: #333646;
      letter-spacing: 0.6px;
    }
    .show-pass {
      //margin-left: 75%;
      //margin-top: 8px;
      //@media (max-width: 430px) {
      //  margin-left: 70%;
      //}
      bottom: 8px;
    }
  }
}

.new-user-body {
  .circle-camera {
    background-color: #333646;
    border-radius: 100px;
    height: 100px;
    margin-bottom: 24px;
    padding: 34px;
    width: 100px;
  }

  .input-box {
    padding: 0 24px;
    width: 100%;

    > input {
      @include regular-text-14();
      background-color: #333646;
      padding: 0 16px;
    }
  }

  .input-box + .input-box {
    margin-top: 16px;
  }
}
</style>
