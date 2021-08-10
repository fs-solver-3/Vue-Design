<template>
  <BModal
    v-model="isShowSync"
    class="position-relative"
    :ok-title="okTitle"
    centered
    :ok-disabled="okDisable"
    size="lg"
    :hide-header="true"
    @ok="handleClickOk"
    @show="onShowModal"
  >
    <img class="btn-close btn-ghost position-absolute" src="@/assets/icon/ic_close.svg" alt="" @click="closeModal" />
    <div class="modal-title text-center">{{ title }}</div>
    <div class="modal-sub-title text-center">{{ subTitle }}</div>
    <div class="item d-flex w-100 justify-content-center align-items-center">
      <slot></slot>
    </div>
  </BModal>
</template>

<script lang="ts">
import { Vue, Component, PropSync, Prop } from 'vue-property-decorator';
@Component
export default class DiCustomCenterModal extends Vue {
  @PropSync('isShow', { type: Boolean })
  isShowSync!: boolean;

  @Prop({ default: '', type: String })
  title!: string;

  @Prop({ default: '', type: String })
  subTitle!: string;

  @Prop({ default: 'OK', type: String })
  okTitle!: string;

  @Prop({ default: false })
  okDisable!: boolean;

  private closeModal() {
    this.isShowSync = false;
  }

  private handleClickOk(e: MouseEvent) {
    this.$emit('ok', e);
  }

  private onShowModal() {
    this.$emit('show');
  }
}
</script>

<style lang="scss" scoped>
.modal-title {
  font-size: 16px;
  font-weight: bold;
  padding: 10px 25px 8px 25px;
  line-height: 1.5;
  letter-spacing: 0.4px;
}
.modal-sub-title {
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.4px;
  padding-bottom: 32px;
}

.btn-close {
  top: 12px;
  right: 12px;
  .title {
    width: 0;
  }
}

::v-deep {
  .modal-footer {
    width: 490px;
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
