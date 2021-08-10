<template>
  <div class="regular-icon-16 text-left">
    <template v-for="(item, index) in menuZoomOptions">
      <DiButton
        :id="genBtnId(`action-${item.text}`, index)"
        :key="genBtnId(`action-${item.text}`, index)"
        :is-disable="item.disabled"
        :title="item.text"
        text-style="regular-text-14-white"
        @click.stop="item.click"
      >
      </DiButton>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { ChartInfo } from '@core/domain';
import { ContextMenuItem, ZoomLevelNode } from '@/shared';
import { getZoomNode, ZoomModule } from '@/store/modules/zoom.store';

@Component
export default class ZoomSetting extends Vue {
  @Prop({ required: true })
  private readonly metaData!: ChartInfo;

  private get menuZoomOptions(): ContextMenuItem[] {
    const currentLvl = ZoomModule.zoomDataAsMap.get(+this.metaData.id)?.currentHorizontalLevel ?? '';
    const zoomNode = getZoomNode(currentLvl).filter(node => node.level != currentLvl);
    return zoomNode.map(node => {
      return {
        text: node.displayName,
        click: () => this.emitZoom(node)
      };
    });
  }

  @Emit('onZoom')
  private emitZoom(node: ZoomLevelNode) {
    return node.level;
  }
}
</script>
