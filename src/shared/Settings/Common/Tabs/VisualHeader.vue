<template>
  <PanelHeader header="Other" target-id="visual-header-tab">
    <!--    <div class="row-config-container">-->
    <!--      <ColorSetting-->
    <!--        disable-->
    <!--        id="visual-header-background-color"-->
    <!--        :default-color="defaultStyle.background"-->
    <!--        :value="background"-->
    <!--        label="Background color"-->
    <!--        size="small"-->
    <!--        style="margin-right: 12px"-->
    <!--        @onChanged="handleBackgroundChanged"-->
    <!--      />-->
    <!--      <ColorSetting-->
    <!--        disable-->
    <!--        id="visual-header-icon-color"-->
    <!--        :default-color="defaultStyle.iconColor"-->
    <!--        :value="iconColor"-->
    <!--        label="Icon color"-->
    <!--        size="small"-->
    <!--        @onChanged="handleIconColorChanged"-->
    <!--      />-->
    <!--    </div>-->
    <ToggleSetting id="header-filter-enable" :value="enableFilter" class="mb-3" label="Enable filter" @onChanged="handleEnableFilterChanged" />
    <ToggleSetting
      v-if="enableSettingDrilldown"
      id="header-drilldown-enable"
      :value="enableDrilldown"
      class="mb-2"
      label="Enable drilldown"
      @onChanged="handleEnableDrilldownChanged"
    />
    <ToggleSetting v-if="enableSettingZoom" id="header-zoom-enable" :value="enableZoom" class="mb-2" label="Enable zoom" @onChanged="handleEnableZoomChanged" />
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { VizSettingData } from '@core/domain';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { VisualHeaderConfigs } from '@/shared/Settings/Common/Config';
import { WidgetType } from '@/shared';

@Component({ components: { PanelHeader } })
export default class VisualHeader extends Vue {
  private readonly defaultStyle = {
    iconColor: '#ffffff',
    background: '#333645',
    enableFilter: true,
    enableDrilldown: false,
    enableMore: false
  };

  @Prop({ required: false, type: Object })
  private readonly setting!: VizSettingData;

  @Prop({ required: false, type: String })
  private readonly widgetType?: WidgetType;

  private get background() {
    return this.setting?.visualHeader?.background ?? this.defaultStyle.background;
  }

  private get iconColor() {
    return this.setting?.visualHeader?.iconColor ?? this.defaultStyle.iconColor;
  }

  private get enableFilter() {
    return this.setting?.affectedByFilter ?? this.defaultStyle.enableFilter;
  }

  private get enableDrilldown() {
    return this.setting?.isEnableDrilldown ?? this.defaultStyle.enableDrilldown;
  }

  private get enableZoom() {
    return this.setting?.isEnableZoom ?? this.defaultStyle.enableMore;
  }

  private get enableSettingDrilldown() {
    if (this.widgetType) {
      return VisualHeaderConfigs.drilldownWidgets.has(this.widgetType);
    } else {
      return false;
    }
  }

  private get enableSettingZoom() {
    if (this.widgetType) {
      return VisualHeaderConfigs.zoomWidgets.has(this.widgetType);
    } else {
      return false;
    }
  }

  private handleEnableFilterChanged(enable: string) {
    this.$emit('onChanged', 'affectedByFilter', enable);
  }

  private handleEnableDrilldownChanged(enable: string) {
    this.$emit('onChanged', 'isEnableDrilldown', enable);
  }

  private handleEnableZoomChanged(enable: string) {
    this.$emit('onChanged', 'isEnableZoom', enable);
  }
}
</script>

<style lang="scss" src="../tab.style.scss"></style>
