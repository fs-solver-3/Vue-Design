<template>
  <DiCustomModal ref="customModal" title="Login Method Settings" ok-title="Save" size="md" @onClickOk="handleSaveLoginSettings" @hide="handleClose">
    <StatusWidget :status="status" :error="errorMessage"></StatusWidget>
    <GoogleSettingItem ref="loginSettingRef" v-if="isLoaded" :loginSettingData.sync="googleSettingData"></GoogleSettingItem>
    <MessageContainer :message="errorMessageModal"></MessageContainer>
  </DiCustomModal>
</template>
<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator';
import DiCustomModal from '@/shared/components/DiCustomModal.vue';
import ToggleSettingComponent from '@/shared/components/builder/setting/ToggleSettingComponent.vue';
import { AuthenticationModule } from '@/store/modules/authentication.store';
import { CollapseTransition } from 'vue2-transitions';
import ChipButton from '@/shared/components/ChipButton.vue';
import { GoogleOauthConfig } from '@core/domain/Model/OauthConfig/GoogleOauthConfig';
import { OauthType, Status } from '@/shared';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { PopupUtils } from '@/utils/popup.utils';
import { cloneDeep } from 'lodash';
import GoogleSettingItem, { BaseOAuthConfigItem } from '@/screens/user_management/components/user_profile_listing/GoogleSettingItem.vue';
import MessageContainer from '@/shared/components/MessageContainer.vue';
import { Log } from '@core/utils';

export class LoginSettingData {
  constructor(public clientId: string, public whitelist: string[], public isActive: boolean, public organizationId: number) {}

  setData(googleOauthConfig: GoogleOauthConfig) {
    this.clientId = googleOauthConfig.clientIds[0];
    this.whitelist = [...googleOauthConfig.whitelistEmail];
    this.isActive = googleOauthConfig.isActive ?? false;
    this.organizationId = googleOauthConfig.organizationId;
  }

  createGoogleOauthConfig(): GoogleOauthConfig {
    return new GoogleOauthConfig('Google', OauthType.GOOGLE, [this.clientId], this.whitelist, this.isActive, this.organizationId);
  }
}

@Component({
  components: {
    MessageContainer,
    GoogleSettingItem,
    StatusWidget,
    ChipButton,
    DiCustomModal,
    ToggleSettingComponent,
    CollapseTransition
  }
})
export default class LoginSettingsModal extends Vue {
  googleSettingData!: LoginSettingData;

  status = Status.Loading;
  errorMessage = '';
  errorMessageModal = '';

  constructor() {
    super();
    this.googleSettingData = new LoginSettingData('', [], false, 0);
  }

  @Ref()
  private customModal!: DiCustomModal;

  @Ref()
  private loginSettingRef!: BaseOAuthConfigItem;

  private get isLoaded() {
    return this.status === Status.Loaded;
  }

  private get googleOauthConfig(): GoogleOauthConfig | null {
    if (AuthenticationModule.googleOauthConfig) {
      return cloneDeep(AuthenticationModule.googleOauthConfig);
    }
    return null;
  }

  show() {
    this.customModal.show();
    this.handleGetLoginSetting();
  }

  handleGetLoginSetting() {
    if (this.googleOauthConfig) {
      this.status = Status.Loaded;
      this.googleSettingData.setData(this.googleOauthConfig);
    } else {
      AuthenticationModule.getLoginMethods()
        .then(() => {
          this.status = Status.Loaded;
          if (this.googleOauthConfig) {
            this.googleSettingData.setData(this.googleOauthConfig);
          }
          Log.debug('LogingSettingModal::show::googleSettingData', this.googleSettingData);
        })
        .catch(err => {
          this.status = Status.Error;
          this.errorMessage = err.message;
        });
    }
  }

  handleClose() {
    if (this.googleOauthConfig) {
      this.googleSettingData.setData(this.googleOauthConfig);
    }
  }

  hide() {
    this.customModal.hide();
    this.errorMessageModal = '';
  }

  private handleSaveLoginSettings(e: MouseEvent) {
    e.preventDefault();
    if (this.loginSettingRef.validate()) {
      const googleOAuthConfig = this.loginSettingRef.getOAuthConfig();

      Log.debug('validate form:::', this.loginSettingRef.validate());
      AuthenticationModule.updateLoginMethods({ ['gg']: googleOAuthConfig })
        .then(() => {
          AuthenticationModule.saveGoogleOauthConfig({ googleOauthConfig: googleOAuthConfig as GoogleOauthConfig });
          PopupUtils.showSuccess('Login Settings is updated successfully.');
          this.hide();
        })
        .catch(err => {
          PopupUtils.showError(err.message);
          this.errorMessageModal = err.message;
        });
    }
  }
}
</script>

<style lang="scss" scoped></style>
