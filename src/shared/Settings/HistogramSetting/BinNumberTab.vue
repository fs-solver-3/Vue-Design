<template>
  <PanelHeader ref="panel" header="general" target-id="bin-number-tab">
    <div class="bin-number-tab">
      <InputSetting
        id="bin-number"
        type="number"
        :value="binNumber"
        class="mb-3 group-config"
        label="Total bin column"
        size="full"
        @onChanged="handleBinNumberChanged"
      />
      <RevertButton class="mb-3 pr-3" style="text-align: right" @click="handleRevert" />
    </div>
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SeriesVizData } from '@core/domain';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';

@Component({ components: { PanelHeader } })
export default class BinNumberTab extends Vue {
  @Prop({ required: false, type: Object })
  setting!: SeriesVizData;

  private get binNumber(): string {
    return this.setting?.binNumber ?? '5';
  }

  private handleBinNumberChanged(newValue: string) {
    return this.$emit('onChangeAndQuery', 'binNumber', newValue);
  }

  private handleRevert() {
    return this.$emit('onChangeAndQuery', 'binNumber', '5');
  }
}
</script>

<style lang="scss" src="../Common/tab.style.scss"></style>
