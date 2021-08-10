<template>
  <PanelHeader header="Display" target-id="display-tab">
    <div class="display-tab">
      <DropdownSetting id="display-selection" :options="seriesOptions" :value="selectedLegend" class="mb-3" size="full" @onSelected="handleSelectedLegend" />
      <div class="row-config-container">
        <DropdownSetting
          id="display-line-dash-style"
          :options="dashOptions"
          :value="dash"
          size="half"
          style="margin-right: 12px"
          @onChanged="handleDashChange"
        />
        <DropdownSetting id="display-line-width" :options="widthOptions" :value="width" disabled size="small" @onChanged="handleWidthChange" />
      </div>
      <div class="row-config-container align-items-end">
        <DropdownSetting
          id="display-type"
          :options="widgetTypeOptions"
          :value="type"
          class="mr-2"
          disabled
          label="Display"
          size="half"
          @onChanged="handleTypeChanged"
        />
        <ToggleSetting v-if="enableMarkerSetting" id="display-show-marker" :value="showMarker" label="Show marker" @onChanged="handleMarkerEnable" />
      </div>
      <RevertButton class="mb-3 pr-3" style="text-align: right" @click="handleRevert" />
    </div>
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { PlotOptions } from '@core/domain/Model/VizSetting/ExtraSetting/ChartStyle/PlotOptions';
import { DashOptions } from '@/shared/Settings/Common/Options/DashOptions';
import { ListUtils } from '@/utils';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import { SeriesOneResponse } from '@core/domain';
import { SelectOption, WidgetType } from '@/shared';
import { StringUtils } from '@/utils/string.utils';
import { get } from 'lodash';
import { Log } from '@core/utils';

@Component({ components: { PanelHeader } })
export default class DisplayTab extends Vue {
  @Prop({ required: false, type: Object })
  private readonly setting!: PlotOptions;
  @Prop({ required: false, type: Array })
  private readonly seriesOptions?: SelectOption[];
  @Prop({ required: false, type: String })
  private readonly widgetType!: WidgetType;

  private selectedLegend: string = this.seriesOptions ? this.seriesOptions[0].id.toString() : '';

  private readonly defaultSetting = {
    width: 2,
    dash: 'Solid',
    showMarker: false
  };

  private get width(): number {
    return get(this.setting, `series.response.${this.selectedLegend}.lineWidth`, this.defaultSetting.width);
  }

  private get dash(): string {
    return get(this.setting, `series.response.${this.selectedLegend}.dashStyle`, this.defaultSetting.dash);
  }

  private get showMarker(): boolean {
    return get(this.setting, `series.response.${this.selectedLegend}.marker.enabled`, this.defaultSetting.showMarker);
  }

  private get type(): WidgetType {
    return get(this.setting, `series.response.${this.selectedLegend}.type`, this.widgetType);
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

  private get widgetTypeOptions(): SelectOption[] {
    let columnOption = { displayName: 'Column', id: WidgetType.column };
    switch (this.widgetType) {
      case WidgetType.bar:
        columnOption = { displayName: 'Bar', id: WidgetType.bar };
        break;
    }
    return [
      columnOption,
      { displayName: 'Line', id: WidgetType.line },
      {
        displayName: 'Area',
        id: WidgetType.area
      }
    ];
  }

  private get enableMarkerSetting(): boolean {
    switch (this.type) {
      case WidgetType.column:
      case WidgetType.bar:
        return false;
      default:
        return true;
    }
  }

  private handleWidthChange(newWidth: number) {
    return this.$emit('onChanged', `plotOptions.series.response.${this.selectedLegend}.lineWidth`, newWidth);
  }

  private handleDashChange(newDash: string) {
    return this.$emit('onChanged', `plotOptions.series.response.${this.selectedLegend}.dashStyle`, newDash);
  }

  private handleMarkerEnable(enabled: boolean) {
    return this.$emit('onChanged', `plotOptions.series.response.${this.selectedLegend}.marker.enabled`, enabled);
  }

  private handleTypeChanged(type: string) {
    return this.$emit('onChanged', `plotOptions.series.response.${this.selectedLegend}.type`, type);
  }

  private handleRevert() {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set(`plotOptions.series.response.${this.selectedLegend}.lineWidth`, this.defaultSetting.width);
    settingAsMap.set(`plotOptions.series.response.${this.selectedLegend}.dashStyle`, this.defaultSetting.dash);
    settingAsMap.set(`plotOptions.series.response.${this.selectedLegend}.marker.enabled`, this.defaultSetting.showMarker);
    settingAsMap.set(`plotOptions.series.response.${this.selectedLegend}.type`, this.widgetType);
    this.$emit('onMultipleChanged', settingAsMap);
  }

  private handleSelectedLegend(newLegend: SelectOption) {
    this.selectedLegend = newLegend.id.toString();
  }
}
</script>

<style lang="scss" scoped></style>
