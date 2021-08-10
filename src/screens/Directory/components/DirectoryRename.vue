<template>
  <b-modal ref="mdRenameDirectory" id="mdRenameDirectory" centered>
    <template v-slot:modal-header="{ close }">
      <h6 class="text-14px">Rename</h6>
      <p class="h5 mb-2">
        <b-icon-x role="button" variant="light" @click="close()"></b-icon-x>
      </p>
    </template>
    <template v-slot:default="">
      <b-form-input
        :id="genInputId('rename-directory')"
        v-model.trim="$v.name.$model"
        variant="dark"
        :placeholder="placeholder"
        class="p-3 h-42px"
        v-on:keydown.enter="rename()"
        autofocus
      ></b-form-input>
      <div class="error" v-if="$v.name.$error">
        <span v-if="!$v.name.maxLength">Max length is 250 chars.</span>
        <span v-if="!$v.name.required">Field is required.</span>
        <span v-if="!$v.name.directoryRule">directoryRule</span>
      </div>
    </template>
    <template v-slot:modal-footer="{ cancel }">
      <b-button class="flex-fill text-white h-42px" variant="secondary" @click="cancel()">
        Cancel
      </b-button>
      <b-button class="flex-fill h-42px" variant="primary" @click="rename()">
        Rename
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';
import { validationMixin } from 'vuelidate';
import { required, maxLength, helpers } from 'vuelidate/lib/validators';
import { DirectoryType, Directory, DirectoryId } from '@core/domain/Model';
import { DirectoryModule } from '@/screens/Directory/store/directory.store';
import { PopupUtils } from '@/utils/popup.utils';

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
export default class DirectoryRename extends Vue {
  $refs!: {
    mdRenameDirectory: BModal;
  };
  directory?: Directory;
  name = '';

  constructor() {
    super();
    this.directory = void 0;
  }

  get placeholder() {
    return 'Type new name';
  }

  show(directory: Directory) {
    this.name = directory.name;
    this.directory = directory;
    this.$refs.mdRenameDirectory.show();
  }

  rename() {
    this.$v.name.$touch();
    if (this.directory && !this.$v.$invalid) {
      if (this.directory.directoryType === DirectoryType.Dashboard) {
        DirectoryModule.renameDashboard({
          id: this.directory.dashboardId!,
          name: this.name,
          oldName: this.directory.name
        }).catch(err => {
          PopupUtils.showError(err.message);
        });
      } else {
        DirectoryModule.renameFolder({
          id: this.directory.id,
          name: this.name,
          oldName: this.directory.name
        }).catch(err => {
          PopupUtils.showError(err.message);
        });
      }
      this.$refs.mdRenameDirectory.hide();
      this.$v.$reset();
    }
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
