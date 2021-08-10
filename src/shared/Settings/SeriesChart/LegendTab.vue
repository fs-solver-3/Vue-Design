<template>
  <PanelHeader header="Legend" target-id="legend-tab">
    <div class="legend-tab">
      <ToggleSetting id="legend-enable" :value="enabled" class="mb-3 group-config" label="On" @onChanged="handleLegendEnabled" />
      <DropdownSetting
        id="legend-position"
        :options="positionOptions"
        :value="position"
        class="mb-3"
        label="Position"
        size="full"
        :style="legendSettingStyle"
        @onChanged="handleChangePosition"
      />
      <InputSetting
        id="legend-title-input"
        :value="title"
        class="mb-3"
        label="Legend name"
        size="full"
        @onChanged="handleTitleSaved"
        :style="legendSettingStyle"
      />
      <DropdownSetting
        id="legend-font-family"
        :enabledRevert="false"
        :options="fontOptions"
        :value="font"
        class="mb-2"
        label="Font family"
        size="full"
        :style="legendSettingStyle"
        @onChanged="handleFontChanged"
      />
      <div class="row-config-container" :style="legendSettingStyle">
        <ColorSetting id="legend-font-color" :default-color="defaultSetting.color" :value="color" class="mr-2" size="small" @onChanged="handleColorChanged" />
        <DropdownSetting id="legend-font-size" :options="fontSizeOptions" :value="fontSize" size="small" @onChanged="handleFontSizeChanged" />
      </div>
      <RevertButton class="mb-3 pr-3" style="text-align: right" @click="handleRevert" />
    </div>
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { LegendSetting } from '@core/domain/Model/VizSetting/ExtraSetting/ChartStyle/LegendSetting';
import { SelectOption } from '@/shared';
import { VerticalAlignOptions } from '@/shared/Settings/Common/Options/VerticalAlignOptions';
import { FontFamilyOptions } from '@/shared/Settings/Common/Options/FontFamilyOptions';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import { FontSizeOptions } from '@/shared/Settings/Common/Options/FontSizeOptions';
import { Log } from '@core/utils';
import { enableCss } from '@/shared/Settings/Common/install';

@Component({ components: { PanelHeader } })
export default class LegendTab extends Vue {
  @Prop({ required: false, type: Object })
  private readonly setting!: LegendSetting;

  private readonly defaultSetting = {
    enabled: true,
    verticalAlign: 'bottom',
    title: '',
    fontFamily: 'Barlow',
    color: '#FFFFFF',
    fontSize: '12px'
  };

  private get enabled(): boolean {
    return this.setting?.enabled ?? this.defaultSetting.enabled;
  }

  private get position(): string {
    return this.setting?.verticalAlign ?? this.defaultSetting.verticalAlign;
  }

  private get positionOptions(): SelectOption[] {
    return VerticalAlignOptions;
  }

  private get title(): string {
    return this.setting?.title?.text ?? this.defaultSetting.title;
  }

  private get font(): string {
    return this.setting?.itemStyle?.fontFamily ?? this.defaultSetting.fontFamily;
  }

  private get fontOptions(): SelectOption[] {
    return FontFamilyOptions;
  }

  private get color() {
    return this?.setting?.itemStyle?.color ?? this.defaultSetting.color;
  }

  private get fontSize(): string {
    return this.setting?.itemStyle?.fontSize ?? this.defaultSetting.fontSize;
  }

  private get fontSizeOptions(): SelectOption[] {
    return FontSizeOptions;
  }

  private handleLegendEnabled(enabled: boolean) {
    Log.debug('SeriesSetting::handleLegendEnabled', enabled);
    return this.$emit('onChanged', 'legend.enabled', enabled);
  }

  private handleChangePosition(newPosition: string) {
    this.$emit('onChanged', 'legend.verticalAlign', newPosition);
  }

  private handleTitleSaved(newText: string) {
    this.$emit('onChanged', 'legend.title.text', newText);
  }

  private handleFontChanged(newFont: string) {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set('legend.title.style.fontFamily', newFont);
    settingAsMap.set('legend.itemStyle.fontFamily', newFont);
    this.$emit('onMultipleChanged', settingAsMap);
  }

  private handleRevert() {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set('legend.title.style.fontFamily', this.defaultSetting.fontFamily);
    settingAsMap.set('legend.itemStyle.fontFamily', this.defaultSetting.fontFamily);
    settingAsMap.set('legend.title.style.color', this.defaultSetting.color);
    settingAsMap.set('legend.itemStyle.color', this.defaultSetting.color);
    settingAsMap.set('legend.title.style.fontSize', this.defaultSetting.fontSize);
    settingAsMap.set('legend.itemStyle.fontSize', this.defaultSetting.fontSize);
    settingAsMap.set('legend.enabled', this.defaultSetting.enabled);
    settingAsMap.set('legend.verticalAlign', this.defaultSetting.verticalAlign);
    settingAsMap.set('legend.title.text', this.defaultSetting.title);
    this.$emit('onMultipleChanged', settingAsMap);
  }

  private handleColorChanged(newColor: string) {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set('legend.title.style.color', newColor);
    settingAsMap.set('legend.itemStyle.color', newColor);
    this.$emit('onMultipleChanged', settingAsMap);
  }

  private handleFontSizeChanged(newFontSize: string) {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set('legend.title.style.fontSize', newFontSize);
    settingAsMap.set('legend.itemStyle.fontSize', newFontSize);
    this.$emit('onMultipleChanged', settingAsMap);
  }
  private get legendSettingStyle(): CSSStyleDeclaration {
    return {
      ...enableCss(this.enabled)
    } as CSSStyleDeclaration;
  }
}
</script>

<style lang="scss" src="../Common/tab.style.scss" />
