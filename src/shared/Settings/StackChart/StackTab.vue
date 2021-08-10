<template>
  <PanelHeader header="Stack" target-id="stack-tab">
    <div class="shape-tab">
      <template v-if="response !== undefined">
        <InputSetting
          v-for="(series, index) in response.series"
          v-bind:key="index"
          :id="`stack-input-${index}`"
          :value="stackOf(series.name)"
          class="mb-3"
          :label="series.name"
          size="full"
          @onChanged="handleStackSaved($event, series.name)"
        />
      </template>
    </div>
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SeriesOneResponse, StackedVizSetting } from '@core/domain';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { StringUtils } from '@/utils/string.utils';

@Component({ components: { PanelHeader } })
export default class StackTab extends Vue {
  @Prop({ required: false, type: Object })
  private readonly response?: SeriesOneResponse;

  @Prop({ required: false, type: Object })
  private readonly setting?: StackedVizSetting;

  private stackOf(seriesName: string): string {
    const normalized = StringUtils.toCamelCase(seriesName);
    return this.setting?.stackingGroup.get(normalized) ?? 'unGroup';
  }
  private handleStackSaved(newStack: string, seriesName: string) {
    const normalized = StringUtils.toCamelCase(seriesName);
    if (this.setting?.stackingGroup.get(normalized) != newStack) return this.$emit('onChanged', `stackingGroup.${normalized}`, newStack);
  }
}
</script>

<style lang="scss" scoped></style>
