<template>
  <div>
    <div
      :id="item.type"
      v-if="isDefaultType"
      class="visualization-item btn-chart btn-border-hovered"
      :class="{ selected: isSelected }"
      @click.stop="handClickItem"
    >
      <div class="text-center">
        <img :src="require(`@/assets/icon/charts/${item.src}`)" class="ic-48 unselectable" alt="chart" />
      </div>
      <div class="text-center title unselectable" style="cursor: pointer">{{ item.title }}</div>
    </div>
    <div
      :id="item.type"
      v-if="isMiniType"
      v-b-tooltip.ds1000.dh010.top.viewport
      :title="item.title"
      class="visualization-item-mini btn-chart btn-border-hovered"
      :class="{ selected: isSelected }"
      @click.stop="handClickItem"
    >
      <div class="text-center">
        <img :src="require(`@/assets/icon/charts/${item.src}`)" class="unselectable" alt="chart" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { VisualizationItemData } from '@/shared';

@Component
export default class VisualizationItem extends Vue {
  @Prop({ required: true })
  private item!: VisualizationItemData;

  @Prop({ type: String, default: 'default' })
  type!: 'mini' | 'default';

  @Prop({ type: Boolean, default: false })
  isSelected!: boolean;

  @Emit('onClickItem')
  private handClickItem(): VisualizationItemData {
    return this.item;
  }

  private get isDefaultType(): boolean {
    return this.type === 'default';
  }

  private get isMiniType(): boolean {
    return this.type === 'mini';
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.visualization-item {
  @include item();
  padding: 24px 12px;
  margin: 12px;
  height: 126px;
  width: 118px;

  > div + div {
    margin-top: 12px;
  }

  .ic-48 {
    width: 48px;
    height: 48px;
  }

  .title {
    @include regular-text();
    font-size: 12px;
    letter-spacing: 0.2px;
    opacity: 0.75;
  }
  &:hover {
    .title {
      opacity: 1;
    }
  }
}

.visualization-item-mini {
  @include item();

  padding: 8px;
  width: 60px;
  height: 60px;
  margin: 0;
  display: flex;
  align-items: center;

  .text-center {
    line-height: 1;

    img {
      width: 40px;
      height: 40px;
    }
  }
}

.selected {
  border: solid 1px var(--accent);
}
</style>
