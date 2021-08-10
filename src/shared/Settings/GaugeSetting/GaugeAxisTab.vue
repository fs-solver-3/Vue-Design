<template>
  <PanelHeader header="Gauge Axis" target-id="gauge-axis-tab">
    <InputSetting id="min-value-input" ref="minInput" type="number" :value="minValue" class="mb-3" label="Min" size="full" @onChanged="handleMinSaved" />
    <InputSetting id="max-value-input" ref="maxInput" type="number" :value="maxValue" class="mb-3" label="Max" size="full" @onChanged="handleMaxSaved" />
    <InputSetting id="target-value-input" type="number" :value="targetValue" class="mb-3" label="Target" size="full" @onChanged="handleTargetSaved" />
    <ColorSetting id="target-color" :value="targetColor" class="mb-3" label="Target line color" size="full" @onChanged="handleTargetLineColorChanged" />
    <RevertButton class="mb-3 pr-3" style="text-align: right" @click="handleRevert" />
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { GaugeVizSetting } from '@core/domain';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import { NumberUtils } from '@core/utils';
import InputSetting from '@/shared/Settings/Common/InputSetting.vue';

@Component({ components: { PanelHeader } })
export default class GaugeAxisTab extends Vue {
  @Prop({ required: false, type: Object })
  private readonly setting!: GaugeVizSetting;

  @Ref()
  minInput?: InputSetting;

  @Ref()
  maxInput?: InputSetting;

  private readonly defaultSetting = {
    min: '0',
    max: '10000',
    target: '0',
    targetColor: '#2187FF'
  };

  private get minValue(): string {
    return `${this.setting?.options?.yAxis?.min}` ?? this.defaultSetting.min;
  }

  private get maxValue(): string {
    return `${this.setting?.options?.yAxis?.max}` ?? this.defaultSetting.max;
  }

  private get targetValue(): string {
    return `${this.setting?.options?.target}` ?? this.defaultSetting.target;
  }

  private get targetColor(): string {
    return this.setting.options.plotOptions?.gauge?.dial?.backgroundColor ?? '';
  }

  private handleRevert() {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set('target', this.defaultSetting.target);
    settingAsMap.set('yAxis.max', this.defaultSetting.max);
    settingAsMap.set('yAxis.min', this.defaultSetting.min);
    this.$emit('onMultipleChanged', settingAsMap);
  }

  private handleMinSaved(newValue: string) {
    const minValue = NumberUtils.toNumber(newValue);
    const maxValue = NumberUtils.toNumber(this.maxValue);
    if (minValue < maxValue) {
      this.$emit('onChanged', 'yAxis.min', minValue);
    } else {
      this.minInput?.setTextInput((maxValue - 1).toString());
    }
  }

  private handleMaxSaved(newValue: string) {
    const maxValue = NumberUtils.toNumber(newValue);
    const minValue = NumberUtils.toNumber(this.minValue);
    if (maxValue > minValue) {
      this.$emit('onChanged', 'yAxis.max', maxValue);
    } else {
      this.maxInput?.setTextInput((minValue + 1).toString());
    }
  }

  private handleTargetSaved(newValue: string) {
    this.$emit('onChanged', 'target', +newValue);
  }

  private handleTargetLineColorChanged(newColor: string) {
    this.$emit('onChanged', 'plotOptions.gauge.dial.backgroundColor', newColor);
  }
}
</script>

<style lang="scss" scoped></style>
