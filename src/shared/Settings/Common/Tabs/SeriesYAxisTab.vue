<template>
  <PanelHeader header="Y Axis" target-id="y-axis-tab">
    <div class="y-axis-tab">
      <ToggleSetting id="y-axis-enable" :value="enabled" class="mb-3 group-config" label="On" @onChanged="handleAxisEnabled" />
      <DropdownSetting
        id="y-axis-category-font-family"
        :options="fontOptions"
        :style="axisSettingStyle"
        :value="categoryFont"
        class="mb-2"
        label="Font family"
        size="full"
        @onChanged="handleCategoryFontChanged"
      />
      <div :style="axisSettingStyle" class="row-config-container">
        <ColorSetting
          id="y-axis-category-font-color"
          :default-color="defaultSetting.categoryColor"
          :value="categoryColor"
          class="mr-2"
          size="small"
          @onChanged="handleCategoryColorChanged"
        />
        <DropdownSetting
          id="y-axis-category-font-size"
          :options="fontSizeOptions"
          :value="categoryFontSize"
          size="small"
          @onChanged="handleCategoryFontSizeChanged"
        />
      </div>
      <ToggleSetting
        id="y-axis-title-enable"
        :style="axisSettingStyle"
        :value="titleEnabled"
        class="mb-3 group-config"
        label="Axis title"
        @onChanged="handleTitleEnabled"
      />
      <InputSetting id="y-axis-title-input" :value="title" class="mb-3" size="full" @onChanged="handleTitleSaved" />
      <DropdownSetting
        id="y-axis-title-font-family"
        :options="fontOptions"
        :style="titleSettingStyle"
        :value="titleFont"
        class="mb-2"
        label="Font family"
        size="full"
        @onChanged="handleTitleFontChanged"
      />
      <div :style="titleSettingStyle" class="row-config-container">
        <ColorSetting
          id="y-axis-title-font-color"
          :default-color="defaultSetting.titleColor"
          :value="titleColor"
          class="mr-2"
          size="small"
          @onChanged="handleTitleColorChanged"
        />
        <DropdownSetting id="y-axis-title-font-size" :options="fontSizeOptions" :value="titleFontSize" size="small" @onChanged="handleTitleFontSizeChanged" />
      </div>
      <ToggleSetting
        id="y-axis-grid-enable"
        :style="axisSettingStyle"
        :value="gridEnabled"
        class="mb-3 group-config"
        label="Gridlines"
        @onChanged="handleGridEnabled"
      />
      <div :style="gridLineChildrenSettingStyle" class="row-config-container">
        <ColorSetting
          id="y-axis-grid-line-color"
          :default-color="defaultSetting.gridLineColor"
          :value="gridLineColor"
          class="mr-2"
          size="half"
          @onChanged="handleGridColorChanged"
        />
        <DropdownSetting
          id="y-axis-grid-line-width"
          :options="widthOptions"
          :value="gridLineWidth"
          disabled
          size="small"
          @onChanged="handleGridLineWidthChanged"
        />
      </div>
      <DropdownSetting
        id="y-axis-grid-line-dash-style"
        :options="dashOptions"
        :style="gridLineChildrenSettingStyle"
        :value="gridLineDashStyle"
        size="full"
        @onChanged="handleGridLineDashStyleChanged"
      />
      <ToggleSetting
        v-if="seriesOptions.length > 1"
        id="dual-axis-enable"
        :value="enableDualAxis"
        class="mb-3 group-config"
        label="Dual Axis"
        @onChanged="handleDualAxisChanged"
      />
      <InputSetting
        v-if="seriesOptions.length > 1"
        id="dual-axis-title-input"
        :disable="!enableDualAxis"
        :value="dualTitle"
        class="mb-3"
        size="full"
        @onChanged="handleDualTitleSaved"
      />
      <div v-if="seriesOptions.length > 1" class="row-config-container align-items-end">
        <DropdownSetting
          id="dual-axis-legend"
          :disable="!enableDualAxis"
          :options="seriesOptions"
          :value="selectedLegend"
          class="mr-2"
          size="half"
          @onSelected="handleSelectedLegend"
        />
        <ToggleSetting id="use-dual-axis" :disable="!enableDualAxis" :value="useDualAxis" label="Second Axis" @onChanged="handleUseDualAxis" />
      </div>
      <RevertButton class="mb-3 pr-3" style="text-align: right" @click="handleRevert" />
    </div>
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AxisSetting, HeatMapQuerySetting, PlotOptions, QuerySetting, QuerySettingType, SeriesQuerySetting } from '@core/domain';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { FontFamilyOptions } from '@/shared/Settings/Common/Options/FontFamilyOptions';
import { FontSizeOptions } from '@/shared/Settings/Common/Options/FontSizeOptions';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import { DashOptions } from '@/shared/Settings/Common/Options/DashOptions';
import { ListUtils } from '@/utils';
import { enableCss } from '@/shared/Settings/Common/install';
import { SelectOption } from '@/shared';
import { get } from 'lodash';

@Component({ components: { PanelHeader } })
export default class SeriesYAxisTab extends Vue {
  @Prop({ required: false, type: Array })
  private readonly setting!: AxisSetting[];
  @Prop({ required: false, type: Object })
  private readonly plotOptions!: PlotOptions;
  @Prop({ required: false, type: Object })
  private readonly query!: QuerySetting;
  @Prop({ required: false, type: Array })
  private readonly seriesOptions?: SelectOption[];
  private selectedLegend: string = this.seriesOptions ? this.seriesOptions[0].id.toString() : '';

  private readonly defaultSetting = {
    visible: true,
    categoryFont: 'Barlow',
    categoryColor: '#FFFFFF',
    categoryFontSize: '11px',
    titleEnabled: true,
    titleFont: 'Barlow',
    titleColor: '#FFFFFF',
    titleFontSize: '11px',
    title: this.defaultText,
    gridLineColor: '#FFFFFF19',
    gridLineDashStyle: 'Solid',
    gridLineWidth: 1,
    dualTitle: 'Untitled'
  };

  private get defaultText() {
    switch (this.query.className) {
      case QuerySettingType.Series:
        return (this.query as SeriesQuerySetting).yAxis[0].name;
      case QuerySettingType.HeatMap:
        return (this.query as HeatMapQuerySetting).yAxis.name;
      default:
        return '';
    }
  }

  private get enabled(): boolean {
    if (this.setting && this.setting[0]) {
      return this.setting[0]?.visible ?? this.defaultSetting.visible;
    }
    return this.defaultSetting.visible;
  }

  private get categoryFont(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0]?.labels?.style?.fontFamily ?? this.defaultSetting.categoryFont;
    }
    return this.defaultSetting.categoryFont;
  }

  private get categoryColor(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0]?.labels?.style?.color ?? this.defaultSetting.categoryColor;
    }
    return this.defaultSetting.categoryColor;
  }

  private get categoryFontSize(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0]?.labels?.style?.fontSize ?? this.defaultSetting.categoryFontSize;
    }
    return this.defaultSetting.categoryFontSize;
  }

  private get titleEnabled(): boolean {
    if (this.setting && this.setting[0]) {
      return this.setting[0]?.title?.enabled ?? this.defaultSetting.titleEnabled;
    }
    return this.defaultSetting.titleEnabled;
  }

  private get titleFont(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0]?.title?.style?.fontFamily ?? this.defaultSetting.titleFont;
    }
    return this.defaultSetting.titleFont;
  }

  private get titleColor(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0]?.title?.style?.color ?? this.defaultSetting.titleColor;
    }
    return this.defaultSetting.titleColor;
  }

  private get titleFontSize(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0]?.title?.style?.fontSize ?? this.defaultSetting.titleFontSize;
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

  private get dualTitle(): string {
    if (this.setting && this.setting[1]) {
      return this.setting[1].title?.text ?? this.defaultSetting.dualTitle;
    }
    return this.defaultSetting.dualTitle;
  }

  private get gridLineColor(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0].gridLineColor ?? this.defaultSetting.gridLineColor;
    }
    return this.defaultSetting.gridLineColor;
  }

  private get gridLineWidth(): number {
    if (this.setting && this.setting[0]) {
      return this.setting[0].gridLineWidth ?? this.defaultSetting.gridLineWidth;
    }
    return this.defaultSetting.gridLineWidth;
  }

  private get gridLineDashStyle(): string {
    if (this.setting && this.setting[0]) {
      return this.setting[0].gridLineDashStyle ?? this.defaultSetting.gridLineDashStyle;
    }
    return this.defaultSetting.gridLineDashStyle;
  }

  private get dashOptions() {
    return DashOptions;
  }

  private get widthOptions() {
    return ListUtils.generate(10, index => {
      const key = index + 1;
      return {
        displayName: key.toString(),
        id: key
      };
    });
  }

  private get gridEnabled(): boolean {
    if (this.setting && this.setting[0]) {
      return this.setting[0].gridLineWidth != 0;
    }
    return false;
  }

  private get gridLineChildrenSettingStyle(): CSSStyleDeclaration {
    return {
      ...enableCss(this.gridEnabled && this.enabled),
      marginBottom: '16px'
    } as CSSStyleDeclaration;
  }

  private get axisSettingStyle(): CSSStyleDeclaration {
    return {
      ...enableCss(this.enabled)
    } as CSSStyleDeclaration;
  }

  private get titleSettingStyle(): CSSStyleDeclaration {
    return {
      ...enableCss(this.enabled && this.titleEnabled)
    } as CSSStyleDeclaration;
  }

  private get enableDualAxis(): boolean {
    return this.setting?.length == 2;
  }

  private get useDualAxis(): boolean {
    const axis = get(this.plotOptions, `series.response.${this.selectedLegend}.yAxis`, 0);
    return axis != 0;
  }

  created() {
    if (!this.setting) {
      this.handleRevert();
    }
  }

  private handleGridEnabled(enabled: boolean) {
    if (enabled) {
      return this.$emit('onChanged', 'yAxis[0].gridLineWidth', 1);
    } else {
      return this.$emit('onChanged', 'yAxis[0].gridLineWidth', 0);
    }
  }

  private handleAxisEnabled(enabled: boolean) {
    return this.$emit('onChanged', 'yAxis[0].visible', enabled);
  }

  private handleCategoryFontChanged(newFont: string) {
    return this.$emit('onChanged', 'yAxis[0].labels.style.fontFamily', newFont);
  }

  private handleCategoryFontSizeChanged(newFontSize: string) {
    return this.$emit('onChanged', 'yAxis[0].labels.style.fontSize', newFontSize);
  }

  private handleCategoryColorChanged(newColor: string) {
    return this.$emit('onChanged', 'yAxis[0].labels.style.color', newColor);
  }

  private handleTitleEnabled(enabled: boolean) {
    return this.$emit('onChanged', 'yAxis[0].title.enabled', enabled);
  }

  private handleTitleSaved(newText: string) {
    return this.$emit('onChanged', 'yAxis[0].title.text', newText);
  }
  private handleDualTitleSaved(newText: string) {
    return this.$emit('onChanged', 'yAxis[1].title.text', newText);
  }

  private handleTitleFontChanged(newFont: string) {
    return this.$emit('onChanged', 'yAxis[0].title.style.fontFamily', newFont);
  }

  private handleTitleColorChanged(newColor: string) {
    return this.$emit('onChanged', 'yAxis[0].title.style.color', newColor);
  }

  private handleTitleFontSizeChanged(newFontSize: string) {
    return this.$emit('onChanged', 'yAxis[0].title.style.fontSize', newFontSize);
  }

  private handleRevert() {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set('yAxis[0].visible', this.defaultSetting.visible);
    settingAsMap.set('yAxis[0].labels.style.fontFamily', this.defaultSetting.categoryFont);
    settingAsMap.set('yAxis[0].labels.style.fontSize', this.defaultSetting.categoryFontSize);
    settingAsMap.set('yAxis[0].labels.style.color', this.defaultSetting.categoryColor);
    settingAsMap.set('yAxis[0].title.enabled', this.defaultSetting.titleEnabled);
    settingAsMap.set('yAxis[0].title.text', this.defaultSetting.title);
    settingAsMap.set('yAxis[0].title.style.fontFamily', this.defaultSetting.titleFont);
    settingAsMap.set('yAxis[0].title.style.fontSize', this.defaultSetting.titleFontSize);
    settingAsMap.set('yAxis[0].title.style.color', this.defaultSetting.titleColor);
    settingAsMap.set('yAxis[0].gridLineWidth', this.defaultSetting.gridLineWidth);
    settingAsMap.set('yAxis[0].gridLineColor', this.defaultSetting.gridLineColor);
    settingAsMap.set('yAxis[0].gridLineDashStyle', this.defaultSetting.gridLineDashStyle);
    this.$emit('onMultipleChanged', settingAsMap);
  }

  private handleGridLineWidthChanged(newWidth: number) {
    if (this.gridEnabled) {
      return this.$emit('onChanged', 'yAxis[0].gridLineWidth', newWidth);
    }
  }

  private handleGridColorChanged(newColor: string) {
    return this.$emit('onChanged', 'yAxis[0].gridLineColor', newColor);
  }

  private handleGridLineDashStyleChanged(newDashStyle: string) {
    return this.$emit('onChanged', 'yAxis[0].gridLineDashStyle', newDashStyle);
  }

  private handleDualAxisChanged(enable: boolean) {
    if (enable) {
      const dualAxisKeyAsMap = this.buildDualAxis();
      this.$emit('onMultipleChanged', dualAxisKeyAsMap);
    } else {
      this.$emit('onChanged', 'yAxis[1]', undefined);
      this.clearDualAxisInResponseSetting();
    }
  }

  private buildDualAxis(): Map<SettingKey, boolean | string | number> {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set('yAxis[1].visible', this.defaultSetting.visible);
    settingAsMap.set('yAxis[1].labels.style.fontFamily', this.categoryFont);
    settingAsMap.set('yAxis[1].labels.style.fontSize', this.categoryFontSize);
    settingAsMap.set('yAxis[1].labels.style.color', this.categoryColor);
    settingAsMap.set('yAxis[1].title.enabled', this.titleEnabled);
    settingAsMap.set('yAxis[1].title.text', this.defaultSetting.dualTitle);
    settingAsMap.set('yAxis[1].title.style.fontFamily', this.titleFont);
    settingAsMap.set('yAxis[1].title.style.fontSize', this.titleFontSize);
    settingAsMap.set('yAxis[1].title.style.color', this.titleColor);
    settingAsMap.set('yAxis[1].gridLineWidth', this.gridLineWidth);
    settingAsMap.set('yAxis[1].gridLineColor', this.gridLineColor);
    settingAsMap.set('yAxis[1].gridLineDashStyle', this.gridLineDashStyle);
    settingAsMap.set('yAxis[1].opposite', true);
    settingAsMap.set('yAxis[1].id', 'dual-axis');
    return settingAsMap;
  }

  private handleSelectedLegend(newLegend: SelectOption) {
    this.selectedLegend = newLegend.id.toString();
  }

  private handleUseDualAxis(enable: boolean) {
    return this.$emit('onChanged', `plotOptions.series.response.${this.selectedLegend}.yAxis`, +enable);
  }

  private clearDualAxisInResponseSetting() {
    const legendSettingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    this.seriesOptions?.forEach(legend => {
      legendSettingAsMap.set(`plotOptions.series.response.${legend.id}.yAxis`, 0);
    });
    this.$emit('onMultipleChanged', legendSettingAsMap);
  }
}
</script>

<style lang="scss" scoped />
