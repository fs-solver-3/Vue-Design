<template>
  <div class="d-flex align-items-center toast-header-custom">
    <img v-if="isSuccessIcon" src="@/assets/icon/ic_success.svg" alt="" />
    <img v-else-if="isErrorIcon" src="@/assets/icon/ic_error.svg" alt="" />
    <div class="title">{{ toastTitle }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Variant } from '@/utils/popup.utils';

@Component
export default class ToastHeader extends Vue {
  @Prop({ required: true })
  variant!: Variant;

  private get isSuccessIcon(): boolean {
    return this.variant === Variant.success;
  }
  private get isErrorIcon(): boolean {
    return this.variant === Variant.danger;
  }

  private get toastTitle(): string {
    switch (this.variant) {
      case Variant.danger:
        return 'Error Message';
      case Variant.success:
        return 'Success Message';
      default:
        return 'Notify Message';
    }
  }
}
</script>

<style lang="scss" scoped>
.toast-header-custom {
  img {
    margin-right: 8px;
  }
}
</style>
