<template>
  <BModal
    ref="diCustomModal"
    id="confirmation-modal"
    title="Please Confirm"
    :no-close-on-esc="false"
    :hide-header="true"
    centered
    size="sm"
    @ok="handleClickOk"
    @cancel="handleCancel"
    ok-title="Confirm"
    class="di-modal"
    @keypress.enter="handleClickOk"
  >
    <div class="slot-body d-flex flex-column text-center">
      <img class="confirmation-image" src="@/assets/icon/ic_exclamation.svg" alt="" />
      <div class="title">Please Confirm</div>
      <div class="message">{{ message }}</div>
    </div>
  </BModal>
</template>
<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator';
import DiCustomModal from '@/shared/components/DiCustomModal.vue';

export interface ModalCallback {
  onOk?: (event: MouseEvent) => void;
  onCancel?: (event: MouseEvent) => void;
}
@Component({
  components: { DiCustomModal }
})
export default class ConfirmationModal extends Vue {
  private message = '';
  private modalCallback?: ModalCallback;

  @Ref()
  readonly diCustomModal?: DiCustomModal;

  show(message: string, modalCallback?: ModalCallback) {
    this.message = message;
    this.modalCallback = modalCallback;
    this.diCustomModal?.show();
  }

  private handleClickOk(event: MouseEvent) {
    if (this.modalCallback?.onOk) {
      this.modalCallback.onOk(event);
    }
  }

  private handleCancel(event: MouseEvent) {
    if (this.modalCallback?.onCancel) {
      this.modalCallback.onCancel(event);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

.slot-body {
  .confirmation-image {
    margin-top: 8px;
    margin-bottom: 12px;
    margin-left: auto;
    margin-right: auto;
    width: 48px;
    height: 48px;
  }
  .title {
    @include bold-text();
    font-size: 16px;
    margin-bottom: 8px;
  }
  .message {
    margin-bottom: 2px;
  }
}

::v-deep {
  .modal-dialog {
    max-width: 398px;
  }
  .modal-footer > button {
    flex-basis: 0;
    flex-grow: 1;
    max-width: 100%;
    height: 42px;
  }
}
</style>
