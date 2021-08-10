<template>
  <div class="overflow-auto flex-grow-1">
    <TitleTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <SeriesGeneralTab v-if="enableGeneralTab" :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <DisplayTab
      :series-options="responseAsSelectOption"
      :setting="setting.options.plotOptions"
      :widget-type="widgetType"
      @onChanged="handleSettingChanged"
      @onMultipleChanged="handleMultipleSettingChanged"
    />
    <LegendTab :setting="setting.options.legend" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <XAxisTab :query="query" :setting="setting.options.xAxis" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <SeriesYAxisTab
      :plotOptions="setting.options.plotOptions"
      :query="query"
      :series-options="responseAsSelectOption"
      :setting="setting.options.yAxis"
      @onChanged="handleSettingChanged"
      @onMultipleChanged="handleMultipleSettingChanged"
    />
    <ColorTab :setting="setting.options.themeColor" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <DataLabelTab :setting="setting.options.plotOptions" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <BackgroundTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <TooltipTab :setting="setting.options.tooltip" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <VisualHeader :widget-type="currentWidget" :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { SeriesOneResponse, SeriesQuerySetting, SeriesVizSetting } from '@core/domain';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import LegendTab from '@/shared/Settings/SeriesChart/LegendTab.vue';
import VisualHeader from '@/shared/Settings/Common/Tabs/VisualHeader.vue';
import BackgroundTab from '@/shared/Settings/Common/Tabs/BackgroundTab.vue';
import TitleTab from '@/shared/Settings/Common/Tabs/TitleTab.vue';
import XAxisTab from '@/shared/Settings/Common/Tabs/XAxisTab.vue';
import ColorTab from '@/shared/Settings/Common/Tabs/ColorTab.vue';
import { SelectOption, WidgetType } from '@/shared';
import DisplayTab from '@/shared/Settings/SeriesChart/DisplayTab.vue';
import DataLabelTab from '@/shared/Settings/SeriesChart/DataLabelTab.vue';
import TooltipTab from '@/shared/Settings/Common/Tabs/TooltipTab.vue';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import SeriesGeneralTab from '@/shared/Settings/SeriesChart/SeriesGeneralTab.vue';
import SeriesYAxisTab from '@/shared/Settings/Common/Tabs/SeriesYAxisTab.vue';
import { StringUtils } from '@/utils/string.utils';

@Component({
  components: {
    LegendTab,
    TitleTab,
    BackgroundTab,
    DataLabelTab,
    ColorTab,
    VisualHeader,
    XAxisTab,
    SeriesYAxisTab,
    TooltipTab,
    DisplayTab,
    SeriesGeneralTab
  }
})
export default class SeriesSetting extends Vue {
  private get query(): SeriesQuerySetting {
    return QueryBuilderStoreModule.getQuerySetting() as SeriesQuerySetting;
  }

  private get setting(): SeriesVizSetting {
    return QueryBuilderStoreModule.getSettingBloc().getVizSetting() as SeriesVizSetting;
  }

  private get response(): SeriesOneResponse | undefined {
    return VisualizationStoreModule.previewVizResponse as SeriesOneResponse;
  }

  private get widgetType(): WidgetType {
    return QueryBuilderStoreModule.itemSelected.type as WidgetType;
  }

  private get enableGeneralTab() {
    return this.widgetType == WidgetType.area;
  }

  private get responseAsSelectOption(): SelectOption[] {
    return (
      this.response?.series
        ?.sort((item, nextItem) => StringUtils.compare(item.name, nextItem.name))
        ?.map(legend => ({
          displayName: legend.name,
          id: StringUtils.toCamelCase(legend.name)
        })) ?? []
    );
  }

  private handleSettingChanged(key: string, value: boolean | string | number | undefined) {
    if (value === undefined) {
      QueryBuilderStoreModule.getSettingBloc().removeSetting(key);
    } else {
      QueryBuilderStoreModule.getSettingBloc().changeSetting(key, value);
    }
  }

  private handleMultipleSettingChanged(settings: Map<SettingKey, boolean | string | number>) {
    QueryBuilderStoreModule.getSettingBloc().multiChangeSetting(settings);
  }

  private get currentWidget(): WidgetType {
    return QueryBuilderStoreModule.itemSelected.type as WidgetType;
  }
}
</script>

<style lang="scss" scoped></style>
