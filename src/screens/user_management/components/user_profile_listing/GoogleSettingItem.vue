<template>
  <div>
    <ToggleSettingComponent class="toggle-btn mx24" :settingItem="settingItem" @onChanged="handleIsActiveChange" />
    <CollapseTransition :delay="5000" easing="ease-in-out" v-show="settingItem.value">
      <div class="mx24">
        <input
          v-model="syncedLoginSettingData.clientId"
          autocomplete="off"
          class="form-control"
          :class="{ 'input-danger': $v.syncedLoginSettingData.$error }"
          placeholder="Client ID"
          type="text"
        />
        <div v-if="$v.syncedLoginSettingData.$error">
          <div v-if="!$v.syncedLoginSettingData.clientId.required" class="text-danger">Client Id is required.</div>
        </div>
        <div class="d-flex align-items-center mt16">
          <input
            v-model="newMailDomain"
            autocomplete="off"
            class="form-control"
            :class="{ 'input-danger': $v.mailDomain.$error }"
            placeholder="New Mail Domain"
            type="text"
            @keydown.enter="handleAddNewMailDomain"
          />
          <b-button class="add-mail-domain" @click="handleAddNewMailDomain">Add</b-button>
        </div>
        <div v-if="$v.mailDomain.$error">
          <div v-if="!$v.newMailDomain.required" class="text-danger">New Main Domain is required.</div>
          <div v-else-if="$v.fakeMail.$error" class="text-danger">New Mail Domain is invalid email domain.</div>
        </div>
        <div class="chip-item-listing d-flex flex-wrap">
          <ChipButton
            v-for="(item, index) in syncedLoginSettingData.whitelist"
            :key="index"
            class="chip-item"
            :title="item"
            :show-icon-remove="true"
            @onRemove="handleRemoveMailDomain(index)"
          ></ChipButton>
        </div>
      </div>
    </CollapseTransition>
  </div>
</template>

<script lang="ts">
import { Component, PropSync, Vue, Watch } from 'vue-property-decorator';
import { SettingItem } from '@/shared/models';
import { SettingItemType } from '@/shared';
import ChipButton from '@/shared/components/ChipButton.vue';
import ToggleSettingComponent from '@/shared/components/builder/setting/ToggleSettingComponent.vue';
import { CollapseTransition } from 'vue2-transitions';
import { email, required } from 'vuelidate/lib/validators';
import { AuthenticationModule } from '@/store/modules/authentication.store';
import { LoginSettingData } from '@/screens/user_management/components/user_profile_listing/LoginSettingsModal.vue';
import { OauthConfig } from '@core/domain/Model/OauthConfig/OauthConfig';
import { Log } from '@core/utils';

export abstract class BaseOAuthConfigItem {
  abstract validate(): boolean;
  abstract getOAuthConfig(): OauthConfig;
}

@Component({
  components: {
    ChipButton,
    ToggleSettingComponent,
    CollapseTransition
  },
  validations: {
    newMailDomain: {
      required
    },
    fakeMail: {
      email
    },
    mailDomain: ['newMailDomain', 'fakeMail'],
    syncedLoginSettingData: {
      clientId: {
        required
      }
    }
  }
})
export default class GoogleSettingItem extends Vue implements BaseOAuthConfigItem {
  private fakeMail = '';
  private newMailDomain = '';

  @PropSync('loginSettingData', { required: true })
  syncedLoginSettingData!: LoginSettingData;

  settingItem: SettingItem = new SettingItem('login', 'Google', AuthenticationModule.isLoginWithGoogle, SettingItemType.toggle, '', []);

  private createEmail(): string {
    return `test@${this.newMailDomain}`;
  }

  handleIsActiveChange(key: string, newValue: boolean) {
    this.settingItem.value = newValue;
    this.syncedLoginSettingData.isActive = newValue;
  }

  public validate() {
    this.$v.syncedLoginSettingData.$touch();
    return !this.$v.syncedLoginSettingData.$invalid;
  }

  private handleAddNewMailDomain() {
    this.fakeMail = this.createEmail();
    Log.debug('fakemail::', this.fakeMail);
    if (this.canAddMailDomain) {
      this.syncedLoginSettingData.whitelist = this.syncedLoginSettingData.whitelist.concat([this.newMailDomain.toLowerCase()]);
      this.$v.newMailDomain.$reset();
      this.newMailDomain = '';
    }
  }

  private get canAddMailDomain(): boolean {
    this.$v.mailDomain.$touch();
    return !this.$v.mailDomain.$invalid && !this.syncedLoginSettingData.whitelist.includes(this.newMailDomain.toLowerCase());
  }

  private handleRemoveMailDomain(index: number) {
    this.syncedLoginSettingData.whitelist.splice(index, 1);
  }

  @Watch('newMailDomain')
  clearNewMailDomainInput() {
    this.$v.mailDomain.$reset();
  }

  getOAuthConfig(): OauthConfig {
    return this.syncedLoginSettingData.createGoogleOauthConfig();
  }
}
</script>

<style lang="scss" scoped>
.ml24 {
  margin-left: 24px;
}

.mx24 {
  margin-right: 24px;
  margin-left: 24px;
}

.mt16 {
  margin-top: 16px;
}

.form-control {
  padding: 16px;

  input {
    width: auto;
  }
}

.toggle-btn {
  margin-bottom: 16px;
  ::v-deep {
    .toggle-title {
      font-size: 16px;
    }
    &:hover {
      background: none !important;
    }
  }
}

.chip-item-listing {
  .chip-item {
    margin-top: 6px;
    margin-right: 6px;
    ::v-deep {
      width: fit-content;
    }
  }
}

.add-mail-domain {
  background: var(--accent);
  width: 100px;
  margin-left: 5px;
}

.input-danger {
  border: 1px solid var(--danger);
}
</style>
