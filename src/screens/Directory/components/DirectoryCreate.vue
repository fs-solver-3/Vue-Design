<template>
  <b-modal ref="mdCreateDirectory" id="mdCreateDirectory" centered>
    <template v-slot:modal-header="{ close }">
      <h6 class="text-14px">{{ title }} name</h6>
      <p class="h5 mb-2 btn-ghost">
        <b-icon-x role="button" :id="genBtnId('close-new-directory')" variant="light" @click="close()"></b-icon-x>
      </p>
    </template>
    <template v-slot:default="">
      <b-form-input
        :id="genInputId('directory-name')"
        v-model.trim="$v.name.$model"
        variant="dark"
        :placeholder="placeholder"
        class="p-3 h-42px"
        autocomplete="off"
        v-on:keydown.enter="create()"
        autofocus
      ></b-form-input>
      <div class="error" v-if="$v.name.$error">
        <span v-if="!$v.name.maxLength">Max length is 250 chars.</span>
        <span v-if="!$v.name.required">Field is required.</span>
        <span v-if="!$v.name.directoryRule"><code>Field can not contain any of the following characters: \"?*&#62;&#60;:|</code></span>
      </div>
    </template>
    <template v-slot:modal-footer="{ cancel }">
      <b-button :id="genBtnId('cancel-new-directory')" class="flex-fill text-white h-42px" variant="secondary" @click="cancel()">
        Cancel
      </b-button>
      <b-button :id="genBtnId('create-new-directory')" class="flex-fill h-42px" variant="primary" @click="create()">
        Create
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import { validationMixin } from 'vuelidate';
import { required, maxLength, helpers } from 'vuelidate/lib/validators';
import { CreateDashboardRequest, CreateDirectoryRequest } from '@core/domain/Request';
import { DirectoryModule } from '@/screens/Directory/store/directory.store';
import { PopupUtils } from '@/utils/popup.utils';
import { Log } from '@core/utils';

// eslint-disable-next-line no-useless-escape
const directoryRule = helpers.regex('directoryRule', /^[^\\\/\?\*\"\>\<\:\|]*$/);

@Component({
  mixins: [validationMixin],
  validations: {
    name: {
      required,
      maxLength: maxLength(250),
      directoryRule
    }
  }
})
export default class DirectoryCreate extends Vue {
  @Ref()
  mdCreateDirectory!: BModal;

  name?: string;
  title: string;

  private newRequest?: CreateDirectoryRequest | CreateDashboardRequest;

  constructor() {
    super();
    this.title = 'Folder';
    this.name = '';
  }

  get placeholder() {
    if (this.title === 'Folder') return 'Type folder name';
    return 'Type dashboard name';
  }

  show(newDirectory: CreateDirectoryRequest | CreateDashboardRequest) {
    this.name = '';
    this.title = newDirectory instanceof CreateDashboardRequest ? 'Dashboard' : 'Folder';
    this.newRequest = newDirectory;
    this.mdCreateDirectory.show();
  }

  create() {
    this.$v.name.$touch();
    if (!this.$v.$invalid && this.newRequest && this.name) {
      this.newRequest.name = this.name;
      if (this.newRequest instanceof CreateDashboardRequest) {
        DirectoryModule.createDashboard(this.newRequest).catch(err => {
          PopupUtils.showError(err.message);
        });
      } else {
        DirectoryModule.createFolder(this.newRequest).catch(err => {
          PopupUtils.showError(err.message);
          Log.debug('createFolder error');
        });
      }
      this.mdCreateDirectory.hide();
      this.$v.$reset();
    }
  }

  @Watch('name')
  resetDirectoryInputError() {
    this.$v.name.$reset();
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';

.text-white {
  @include regular-text;
  letter-spacing: 0.18px;
  text-align: center;
  color: $primaryTextColor;
}

.error {
  font-family: Barlow;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #ff5959;
  margin-top: 10px;
}
</style>
