<template>
  <PanelHeader header="Data Label" target-id="data-label-tab">
    <div class="data-label-tab">
      <ToggleSetting id="data-label-enable" :value="enabled" class="mb-3 group-config" label="On" @onChanged="handleDataLabelEnabled" />
      <DropdownSetting
        v-if="haveLabelFormatSetting"
        id="data-label-format"
        :options="labelFormatOptions"
        :value="labelFormat"
        class="mb-2"
        label="Label style"
        size="full"
        :style="labelSettingStyle"
        @onChanged="handleLabelFormatChanged"
      />
      <DropdownSetting
        id="data-label-font-family"
        :options="fontOptions"
        :value="font"
        class="mb-2"
        label="Font family"
        size="full"
        :style="labelSettingStyle"
        @onChanged="handleFontChanged"
      />
      <div class="row-config-container" :style="labelSettingStyle">
        <ColorSetting
          id="data-label-font-color"
          :default-color="defaultSetting.color"
          :value="color"
          class="mr-2"
          size="small"
          @onChanged="handleColorChanged"
        />
        <DropdownSetting id="data-label-font-size" :options="fontSizeOptions" :value="fontSize" size="small" @onChanged="handleFontSizeChanged" />
      </div>
      <DropdownSetting
        id="data-label-display-unit"
        :options="displayUnitOptions"
        :value="displayUnit"
        class="mb-2"
        label="Display unit"
        size="full"
        :style="labelSettingStyle"
        @onChanged="handleDisplayUnitChanged"
      />
      <SliderSetting
        v-if="haveDistanceSetting"
        id="data-label-distance"
        label="Label position"
        class="mb-2 group-config"
        :min="-60"
        :max="60"
        :value="distance"
        :style="labelSettingStyle"
        @onChanged="handleDistanceChanged"
      />
      <DropdownSetting
        v-if="havePositionSetting"
        id="data-label-position"
        :value="position"
        :options="positionOptions"
        class="mb-3"
        size="full"
        label="Label position"
        :style="labelSettingStyle"
        @onChanged="handlePositionChanged"
      />
      <RevertButton class="mb-3 pr-3" style="text-align: right" @click="handleRevert" />
    </div>
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { PlotOptions } from '@core/domain/Model/VizSetting/ExtraSetting/ChartStyle/PlotOptions';
import { SelectOption, WidgetType } from '@/shared';
import { DisplayUnitOptions } from '@/shared/Settings/Common/Options/DisplayUnitOptions';
import { FontFamilyOptions } from '@/shared/Settings/Common/Options/FontFamilyOptions';
import { FontSizeOptions } from '@/shared/Settings/Common/Options/FontSizeOptions';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import { LabelFormatOptions } from '@/shared/Settings/Common/Options/LabelFormatOptions';
import { DataLabelFormatterMode } from '@chart/PieChart';
import { get } from 'lodash';
import { MetricNumberMode } from '@/utils';
import SliderSetting from '@/shared/Settings/Common/SliderSetting.vue';
import { LabelPositionOptions } from '@/shared/Settings/Common/Options/LabelPositionOptions';
import { enableCss } from '@/shared/Settings/Common/install';

@Component({ components: { SliderSetting, PanelHeader } })
export default class DataLabelTab extends Vue {
  @Prop({ required: false, type: Object })
  private readonly setting!: PlotOptions;
  @Prop({ required: false, type: String })
  private readonly widgetType!: WidgetType;
  private readonly defaultSetting = {
    enabled: false,
    labelFormat: DataLabelFormatterMode.NameAndValue,
    fontFamily: 'Barlow',
    color: '#FFFFFF',
    fontSize: '12px',
    displayUnit: MetricNumberMode.Default,
    distance: 30,
    position: false
  };

  private get seriesKey(): string {
    switch (this.widgetType) {
      case WidgetType.pie:
        return 'pie';
      case WidgetType.gauges:
        return 'solidgauge';
      case WidgetType.treeMap:
        return 'treemap';
      case WidgetType.pyramid:
        return 'pyramid';
      case WidgetType.funnel:
        return 'funnel';
      case WidgetType.heatMap:
        return 'heatmap';
      case WidgetType.parliament:
        return 'item';
      default:
        return 'series';
    }
  }

  private get haveLabelFormatSetting() {
    switch (this.widgetType) {
      case WidgetType.funnel:
      case WidgetType.pyramid:
      case WidgetType.pie:
        return true;
      default:
        return false;
    }
  }

  private get haveDistanceSetting() {
    return this.widgetType === WidgetType.pie;
  }

  private get havePositionSetting() {
    switch (this.widgetType) {
      case WidgetType.funnel:
      case WidgetType.pyramid:
        return true;
      default:
        return false;
    }
  }

  private get enabled(): boolean {
    return get(this.setting, `${this.seriesKey}.dataLabels.enabled`, this.defaultSetting.enabled);
  }

  private get labelFormat(): DataLabelFormatterMode {
    return get(this.setting, `${this.seriesKey}.dataLabels.labelFormat`, this.defaultSetting.labelFormat);
  }

  private get labelFormatOptions(): SelectOption[] {
    return LabelFormatOptions;
  }

  private get font(): string {
    return get(this.setting, `${this.seriesKey}.dataLabels.style.fontFamily`, this.defaultSetting.fontFamily);
  }

  private get color(): string {
    return get(this.setting, `${this.seriesKey}.dataLabels.style.color`, this.defaultSetting.color);
  }

  private get fontSize(): string {
    return get(this.setting, `${this.seriesKey}.dataLabels.style.fontSize`, this.defaultSetting.fontSize);
  }

  private get displayUnit(): string {
    return get(this.setting, `${this.seriesKey}.dataLabels.displayUnit`, this.defaultSetting.displayUnit);
  }

  private get distance(): string {
    return get(this.setting, `${this.seriesKey}.dataLabels.distance`, this.defaultSetting.distance);
  }

  private get position(): string {
    return get(this.setting, `${this.seriesKey}.dataLabels.inside`, this.defaultSetting.position);
  }

  private get displayUnitOptions(): SelectOption[] {
    return DisplayUnitOptions;
  }

  private get fontOptions(): SelectOption[] {
    return FontFamilyOptions;
  }

  private get fontSizeOptions(): SelectOption[] {
    return FontSizeOptions;
  }

  private get positionOptions(): SelectOption[] {
    return LabelPositionOptions;
  }

  private handleDataLabelEnabled(enabled: boolean) {
    return this.$emit('onChanged', `plotOptions.${this.seriesKey}.dataLabels.enabled`, enabled);
  }
  private handleLabelFormatChanged(newLabelFormat: DataLabelFormatterMode) {
    return this.$emit('onChanged', `plotOptions.${this.seriesKey}.dataLabels.labelFormat`, newLabelFormat);
  }

  private handleFontChanged(newFont: string) {
    return this.$emit('onChanged', `plotOptions.${this.seriesKey}.dataLabels.style.fontFamily`, newFont);
  }

  private handleColorChanged(newColor: string) {
    return this.$emit('onChanged', `plotOptions.${this.seriesKey}.dataLabels.style.color`, newColor);
  }

  private handleFontSizeChanged(newFontSize: string) {
    this.$emit('onChanged', `plotOptions.${this.seriesKey}.dataLabels.style.fontSize`, newFontSize);
  }

  private handleDisplayUnitChanged(newDisplayUnit: string) {
    return this.$emit('onChanged', `plotOptions.${this.seriesKey}.dataLabels.displayUnit`, newDisplayUnit);
  }

  private handleDistanceChanged(newDistance: number) {
    return this.$emit('onChanged', `plotOptions.${this.seriesKey}.dataLabels.distance`, newDistance);
  }

  private handlePositionChanged(newPosition: string) {
    return this.$emit('onChanged', `plotOptions.${this.seriesKey}.dataLabels.inside`, newPosition);
  }

  private handleRevert() {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set(`plotOptions.${this.seriesKey}.dataLabels.enabled`, this.defaultSetting.enabled);
    settingAsMap.set(`plotOptions.${this.seriesKey}.dataLabels.style.fontSize`, this.defaultSetting.fontSize);
    settingAsMap.set(`plotOptions.${this.seriesKey}.dataLabels.style.color`, this.defaultSetting.color);
    settingAsMap.set(`plotOptions.${this.seriesKey}.dataLabels.style.fontFamily`, this.defaultSetting.fontFamily);
    settingAsMap.set(`plotOptions.${this.seriesKey}.dataLabels.displayUnit`, this.defaultSetting.displayUnit);
    if (this.haveLabelFormatSetting) {
      settingAsMap.set(`plotOptions.${this.seriesKey}.dataLabels.labelFormat`, this.defaultSetting.labelFormat);
    }
    if (this.havePositionSetting) {
      settingAsMap.set(`plotOptions.${this.seriesKey}.dataLabels.position`, this.defaultSetting.position);
    }
    if (this.haveDistanceSetting) {
      settingAsMap.set(`plotOptions.${this.seriesKey}.dataLabels.distance`, this.defaultSetting.distance);
    }
    this.$emit('onMultipleChanged', settingAsMap);
  }

  private get labelSettingStyle(): CSSStyleDeclaration {
    return {
      ...enableCss(this.enabled)
    } as CSSStyleDeclaration;
  }
}
</script>

<style lang="scss" scoped></style>
