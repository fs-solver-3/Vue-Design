<template>
  <div class="d-flex flex-row justify-content-between w-100">
    <div class="item-contents align-items-center">
      <a v-if="enableFuncFamily" class="select-function btn-ghost-alter" @click.stop="handleClickFuncFamily">
        {{ node.functionFamily }}
      </a>
      <a v-if="enableFuncType" class="select-function btn-ghost-alter" @click.stop="handleClickFuncType">
        {{ node.functionType }}
      </a>
      <label v-b-tooltip.d500.top="getFieldInfo(node)" class="display-name btn-ghost-alter text-decoration-none" @click.stop="handleClickName">
        {{ node.displayName }}
      </label>
      <template v-if="enableSortingConfig">
        <a class="select-function btn-ghost-alter" @click.stop="handleClickSorting">
          {{ node.sorting }}
        </a>
        <a v-if="enableNumElemsShown" class="display-n-element"> Top {{ node.numElemsShown }} value(s) </a>
      </template>
    </div>
    <img :style="{ opacity: opacity }" alt="more" class="more-icon btn-ghost-alter" src="@/assets/icon/charts/ic_more.svg" @click="handleClickMore" />
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { ConfigType, FunctionTreeNode } from '@/shared';
import { SchemaUtils, TimeoutUtils } from '@/utils';
import { PopupUtils } from '@/utils/popup.utils';

@Component
export default class DraggableItem extends Vue {
  @Prop({ required: true, type: Object })
  private readonly node!: FunctionTreeNode;

  @Prop({ required: true, type: String })
  private readonly configType!: ConfigType;

  @Prop({ required: true, type: Number })
  private readonly opacity!: number;

  private get enableFuncFamily() {
    return this.node.functionFamily;
  }

  private get enableFuncType() {
    return this.node.functionType;
  }

  private get enableSortingConfig() {
    return this.configType == ConfigType.sorting;
  }

  private get enableNumElemsShown() {
    return this.node.isShowNElements && this.node.numElemsShown;
  }

  @Emit('clickFuncFamily')
  private handleClickFuncFamily(event: MouseEvent) {
    PopupUtils.hideAllPopup();
    return event;
  }

  @Emit('clickFuncType')
  private handleClickFuncType(event: MouseEvent) {
    PopupUtils.hideAllPopup();
    return event;
  }

  @Emit('clickName')
  private handleClickName(event: MouseEvent) {
    PopupUtils.hideAllPopup();
    return event;
  }

  @Emit('clickSorting')
  private handleClickSorting(event: MouseEvent) {
    PopupUtils.hideAllPopup();
    return event;
  }

  private handleClickMore(event: MouseEvent) {
    // workaround: don't use event.stopPropagation(), because other popup will not close.
    TimeoutUtils.waitAndExec(null, () => this.$emit('clickMore', event), 80);
  }

  private getFieldInfo(node: FunctionTreeNode): string {
    return SchemaUtils.getFieldName(node);
  }
}
</script>
