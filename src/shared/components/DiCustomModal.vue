<template>
  <BModal
    :id="id"
    ref="modal"
    :cancelTitle="cancelTitle"
    :okTitle="okTitle"
    :size="size"
    centered
    :no-close-on-esc="false"
    class="rounded"
    @ok="handleClickOk"
    @cancel="handleCancel"
    @hide="handleClose"
    @close="handleCancel"
    :modal-class="modalClass"
  >
    <template #modal-header="{ close }">
      <div class="custom-header d-inline-flex w-100">
        <h6 class="modal-title">{{ title }}</h6>
        <button aria-label="Close" class="ml-auto close btn-ghost" type="button" @click.prevent="close()">
          <BIconX class="button-x" />
        </button>
      </div>
    </template>
    <template #default>
      <slot></slot>
    </template>
  </BModal>
</template>

<script lang="ts">
import { Component, Emit, Prop, Ref, Vue } from 'vue-property-decorator';
import { BModal } from 'bootstrap-vue';

@Component
export default class DiCustomModal extends Vue {
  @Prop({ type: String, default: 'custom-modal' })
  private id!: string;

  @Prop({ required: true, type: String })
  private title!: string;

  @Prop({ type: String, default: 'Cancel' })
  private cancelTitle!: string;

  @Prop({ type: String, default: 'Ok' })
  private okTitle!: string;

  @Prop({ type: String, default: 'lg' })
  private size!: 'sm' | 'md' | 'lg' | 'xl';

  @Prop({ type: String, required: false, default: '' })
  private readonly modalClass!: string;

  @Ref()
  private modal!: BModal;

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  @Emit('onClickOk')
  private handleClickOk(bvModalEvt: MouseEvent) {
    return bvModalEvt;
  }

  @Emit('onCancel')
  private handleCancel(bvModalEvt: MouseEvent) {
    return bvModalEvt;
  }

  @Emit('hide')
  handleClose(bvModalEvt: MouseEvent) {
    return bvModalEvt;
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.custom-header {
  margin-left: 8px;
  margin-right: 8px;
  margin-top: 8px;

  .modal-title {
    @include bold-text-16();
  }

  .button-x {
    color: white;
  }
}

::v-deep {
  .modal-footer > button {
    flex-basis: 0;
    flex-grow: 1;
    max-width: 100%;
    height: 42px;
  }
}
</style>
