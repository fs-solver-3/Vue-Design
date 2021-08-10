<template>
  <PanelHeader header="X Axis" target-id="x-axis-tab">
    <div class="x-axis-tab">
      <ToggleSetting id="x-axis-enable" :value="enabled" class="mb-3 group-config" label="On" @onChanged="handleAxisEnabled" />
      <DropdownSetting
        id="x-axis-category-font-family"
        :options="fontOptions"
        :value="categoryFont"
        class="mb-2"
        label="Font family"
        size="full"
        @onChanged="handleCategoryFontChanged"
      />
      <div class="row-config-container">
        <ColorSetting
          id="x-axis-category-font-color"
          :default-color="defaultSetting.categoryColor"
          :value="categoryColor"
          class="mr-2"
          size="small"
          @onChanged="handleCategoryColorChanged"
        />
        <DropdownSetting
          id="x-axis-category-font-size"
          :options="fontSizeOptions"
          :value="categoryFontSize"
          size="small"
          @onChanged="handleCategoryFontSizeChanged"
        />
      </div>
      <ToggleSetting id="x-axis-title-enable" :value="titleEnabled" class="mb-3 group-config" label="Axis title" @onChanged="handleTitleEnabled" />
      <InputSetting id="x-axis-title-input" :value="title" class="mb-3" size="full" @onChanged="handleTitleSaved" />
      <DropdownSetting
        id="x-axis-title-font-family"
        :options="fontOptions"
        :value="titleFont"
        class="mb-2"
        label="Font family"
        size="full"
        @onChanged="handleTitleFontChanged"
      />
      <div class="row-config-container">
        <ColorSetting
          id="x-axis-title-font-color"
          :default-color="defaultSetting.color"
          :value="titleColor"
          class="mr-2"
          size="small"
          @onChanged="handleTitleColorChanged"
        />
        <DropdownSetting id="x-axis-title-font-size" :options="fontSizeOptions" :value="titleFontSize" size="small" @onChanged="handleTitleFontSizeChanged" />
      </div>
      <RevertButton class="mb-3 pr-3" style="text-align: right" @click="handleRevert" />
    </div>
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { AxisSetting, QuerySettingType, SeriesQuerySetting } from '@core/domain';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting.ts';
import { FontFamilyOptions } from '@/shared/Settings/Common/Options/FontFamilyOptions';
import { FontSizeOptions } from '@/shared/Settings/Common/Options/FontSizeOptions';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';

@Component({ components: { PanelHeader } })
export default class XAxisTab extends Vue {
  @Prop({ required: false, type: Array })
  private readonly setting!: AxisSetting[];
  @Prop({ required: false, type: Object })
  private readonly query!: QuerySetting;
  private readonly defaultSetting = {
    visible: true,
    categoryFont: 'Barlow',
    categoryColor: '#FFFFFF',
    categoryFontSize: '11px',
    titleEnabled: true,
    titleFont: 'Barlow',
    titleColor: '#FFFFFF',
    titleFontSize: '11px',
    title: this.defaultText
  };

  private get defaultText() {
    switch (this.query.className) {
      case QuerySettingType.Series:
        return (this.query as SeriesQuerySetting).xAxis.name;
      default:
        return '';
    }
  }

  private get enabled(): boolean {
    if (this.setting && this.setting[0]) {
      return this.setting[0].visible ?? this.defaultSetting.visible;
    }
    return this.defaultSetting.visible;
  }

  private get categoryFont(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0].labels?.style?.fontFamily ?? this.defaultSetting.categoryFont;
    }
    return this.defaultSetting.categoryFont;
  }

  private get categoryColor(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0].labels?.style?.color ?? this.defaultSetting.categoryColor;
    }
    return this.defaultSetting.categoryColor;
  }

  private get categoryFontSize(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0].labels?.style?.fontSize ?? this.defaultSetting.categoryFontSize;
    }
    return this.defaultSetting.categoryFontSize;
  }

  private get titleEnabled(): boolean {
    if (this.setting && this.setting[0]) {
      return this.setting[0].title?.enabled ?? this.defaultSetting.titleEnabled;
    }
    return this.defaultSetting.titleEnabled;
  }

  private get titleFont(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0].title?.style?.fontFamily ?? this.defaultSetting.titleFont;
    }
    return this.defaultSetting.titleFont;
  }

  private get titleColor(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0].title?.style?.color ?? this.defaultSetting.titleColor;
    }
    return this.defaultSetting.titleColor;
  }

  private get titleFontSize(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0].title?.style?.fontSize ?? this.defaultSetting.titleFontSize;
    }
    return this.defaultSetting.titleFontSize;
  }

  private get fontOptions() {
    return FontFamilyOptions;
  }

  private get fontSizeOptions() {
    return FontSizeOptions;
  }

  private get title(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0].title?.text ?? this.defaultSetting.title;
    }
    return this.defaultSetting.title;
  }

  private handleAxisEnabled(enabled: boolean) {
    return this.$emit('onChanged', 'xAxis[0].visible', enabled);
  }

  private handleCategoryFontChanged(newFont: string) {
    return this.$emit('onChanged', 'xAxis[0].labels.style.fontFamily', newFont);
  }

  private handleCategoryFontSizeChanged(newFontSize: string) {
    return this.$emit('onChanged', 'xAxis[0].labels.style.fontSize', newFontSize);
  }

  private handleCategoryColorChanged(newColor: string) {
    return this.$emit('onChanged', 'xAxis[0].labels.style.color', newColor);
  }

  private handleTitleEnabled(enabled: boolean) {
    return this.$emit('onChanged', 'xAxis[0].title.enabled', enabled);
  }

  private handleTitleSaved(newText: string) {
    return this.$emit('onChanged', 'xAxis[0].title.text', newText);
  }

  private handleTitleFontChanged(newFont: string) {
    return this.$emit('onChanged', 'xAxis[0].title.style.fontFamily', newFont);
  }

  private handleTitleColorChanged(newColor: string) {
    return this.$emit('onChanged', 'xAxis[0].title.style.color', newColor);
  }

  private handleTitleFontSizeChanged(newFontSize: string) {
    return this.$emit('onChanged', 'xAxis[0].title.style.fontSize', newFontSize);
  }

  private handleRevert() {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set('xAxis[0].visible', this.defaultSetting.visible);
    settingAsMap.set('xAxis[0].labels.style.fontFamily', this.defaultSetting.categoryFont);
    settingAsMap.set('xAxis[0].labels.style.fontSize', this.defaultSetting.categoryFontSize);
    settingAsMap.set('xAxis[0].labels.style.color', this.defaultSetting.categoryColor);
    settingAsMap.set('xAxis[0].title.enabled', this.defaultSetting.titleEnabled);
    settingAsMap.set('xAxis[0].title.text', this.defaultSetting.title);
    settingAsMap.set('xAxis[0].title.style.fontFamily', this.defaultSetting.titleFont);
    settingAsMap.set('xAxis[0].title.style.fontSize', this.defaultSetting.titleFontSize);
    settingAsMap.set('xAxis[0].title.style.color', this.defaultSetting.titleColor);
    this.$emit('onMultipleChanged', settingAsMap);
  }
}
</script>

<style lang="scss" scoped></style>
