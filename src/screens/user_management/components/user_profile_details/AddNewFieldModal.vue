<template>
  <DiCustomModal ref="customModal" ok-title="Add New Field" size="md" title="Add New Field" @onClickOk="handleClickOk">
    <div class="new-field-body d-flex flex-column align-items-center">
      <div class="input-box">
        <div class="title">Name</div>
        <input
          v-model="newFieldData.fieldName"
          autocomplete="off"
          class="form-control"
          :class="{ danger: $v.newFieldData.fieldName.$error }"
          placeholder="New field name"
          type="text"
        />
        <div v-if="$v.newFieldData.fieldName.$error">
          <div v-if="!$v.newFieldData.fieldName.required" class="text-warning">Field Name is required</div>
        </div>
      </div>

      <div class="input-box">
        <div class="title">Value</div>
        <input
          v-model="newFieldData.fieldValue"
          autocomplete="off"
          class="form-control"
          :class="{ danger: $v.newFieldData.fieldValue.$error }"
          placeholder="New field value"
          type="text"
        />
        <div v-if="$v.newFieldData.fieldValue.$error">
          <div v-if="!$v.newFieldData.fieldValue.required" class="text-warning">Field Value is required</div>
        </div>
      </div>
      <div class="pt-3">
        <BSpinner v-if="isLoading" label="Spinning"></BSpinner>
        <pre v-if="isError" class="error-message">{{ errorMessage }}</pre>
      </div>
    </div>
  </DiCustomModal>
</template>

<script lang="ts">
import DiCustomModal from '@/shared/components/DiCustomModal.vue';
import { Component, Ref, Vue } from 'vue-property-decorator';
import { required } from 'vuelidate/lib/validators';
import { EditUserProfileRequest } from '@core/admin/domain/request/EditUserProfileRequest';
import { UserProfileDetailModule } from '@/screens/user_management/store/user_profile_detail.store';
import { DIException } from '@core/domain/Exception';
import { PopupUtils } from '@/utils/popup.utils';
import { Status } from '@/shared';
import { Log } from '@core/utils';

export class NewFieldData {
  constructor(public fieldName: string, public fieldValue: string) {}
  static empty(): NewFieldData {
    return new NewFieldData('', '');
  }
}

@Component({
  components: {
    DiCustomModal
  },
  validations: {
    newFieldData: {
      fieldName: { required },
      fieldValue: { required }
    }
  }
})
export default class AddNewFieldModal extends Vue {
  private newFieldData: NewFieldData = NewFieldData.empty();
  errorMessage = '';
  private status = Status.Loaded;

  @Ref()
  private customModal!: DiCustomModal;

  get userFullDetailInfo() {
    return UserProfileDetailModule.userFullDetailInfo;
  }

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

  private isAddNewField(): boolean {
    // TODO: validate here
    this.$v.$touch();
    if (this.$v.$invalid) {
      return false;
    }
    return true;
  }

  private handleClickOk(event: MouseEvent) {
    event.preventDefault();
    Log.debug('addNewFieldModal::handleClick::click');
    if (this.isAddNewField()) {
      // this.$emit('handleSubmitNewField', this.newFieldData);
      this.status = Status.Loading;
      this.handleSaveNewField(this.newFieldData).then(status => {
        if (status) {
          this.hide();
        }
      });
    }
  }

  private handleSaveNewField(newFieldData: NewFieldData): Promise<boolean> {
    Log.debug('Contact::handleAddNewField::newFieldData::', newFieldData);
    const request: EditUserProfileRequest = EditUserProfileRequest.createEditRequest(this.userFullDetailInfo?.profile?.username!, {
      properties: {
        ...this.userFullDetailInfo?.profile?.properties,
        [newFieldData.fieldName]: newFieldData.fieldValue
      }
    });
    return UserProfileDetailModule.editUserProfile(request)
      .then(() => {
        PopupUtils.showSuccess(`${this.userFullDetailInfo?.profile?.fullName}'s profile is updated successfully.`);
        this.status = Status.Loaded;
        return true;
      })
      .catch(ex => {
        this.handleError(ex);
        this.status = Status.Error;
        return false;
      });
  }

  handleError(ex: DIException) {
    Log.debug('AddNewFieldModal::handleError::error', ex.message);
    this.errorMessage = ex.message;
  }

  private resetData() {
    this.newFieldData = NewFieldData.empty();
    this.errorMessage = '';
    this.$v.$reset();
    this.status = Status.Loaded;
  }
}
</script>

<style lang="scss">
@import '~@/themes/scss/di-variables.scss';
@import '~@/themes/scss/mixin.scss';

.danger {
  border: 1px solid var(--danger);
}

pre {
  white-space: pre-wrap;
}

.new-field-body {
  .input-box {
    padding: 0 24px;
    width: 100%;

    .title {
      @include regular-text;
      font-size: 12px;
      padding-bottom: 8px;
      opacity: 0.5;
    }

    > input {
      @include regular-text-14();
      padding: 10px 16px;
      height: 42px;
    }
    .text-warning {
      color: var(--danger) !important;
    }
  }

  .input-box + .input-box {
    margin-top: 16px;
  }

  .error-message {
    color: var(--danger);
    padding: 10px 24px;
  }
}
</style>
