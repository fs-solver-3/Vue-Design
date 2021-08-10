<template>
  <VueContext
    v-if="currentDrilldownMeta"
    ref="drilldownContext"
    :close-on-click="false"
    :close-on-scroll="false"
    class="drilldown-context-menu"
    tag="div"
    @close="removeListenScroll"
  >
    <DrilldownSetting
      :defaultDrilldownValue="defaultDrilldownValue"
      :displayType="DisplayTypes.Context"
      :metaData="currentDrilldownMeta"
      class="context-drilldown"
      @hide="hide"
    />
  </VueContext>
</template>

<script lang="ts">
import { Component, Ref } from 'vue-property-decorator';
import { ChartInfo, QueryRelatedWidget } from '@core/domain';
import { MouseEventData } from '@/shared/components/charts/BaseChart';
import DrilldownSetting, { DisplayTypes } from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/Drilldown/DrilldownSetting.vue';
import VueContext from 'vue-context';
import { AutoHideContextMenu } from '@/screens/DashboardDetail/components/AutoHideContextMenu';

@Component({
  components: {
    DrilldownSetting,
    VueContext
  }
})
export default class DrilldownSettingContextMenu extends AutoHideContextMenu {
  private defaultDrilldownValue = '';
  private currentDrilldownMeta: QueryRelatedWidget | null = null;
  private DisplayTypes = DisplayTypes;

  @Ref()
  private readonly drilldownContext?: VueContext;

  show(metaData: ChartInfo, mouseEventData: MouseEventData<string>): void {
    this.hide();
    this.$nextTick(() => {
      this.currentDrilldownMeta = metaData;
      this.defaultDrilldownValue = mouseEventData.data.toString();
      this.$nextTick(() => {
        this.drilldownContext?.open(mouseEventData.event, {});
      });
    });
    this.listenScroll();
  }

  hide() {
    this.currentDrilldownMeta = null;
    this.drilldownContext?.close();
  }
}
</script>

<style lang="scss">
div.v-context.drilldown-context-menu {
  background: transparent;
  border: none;
  border-radius: 4px;
  box-shadow: none;
  height: 450px;

  .custom-listing {
    max-height: 294px;
  }
}
</style>
