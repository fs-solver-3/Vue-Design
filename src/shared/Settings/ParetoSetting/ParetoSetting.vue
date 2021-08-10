<template>
  <div class="overflow-auto flex-grow-1">
    <TitleTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <LegendTab :setting="setting.options.legend" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <XAxisTab :query="query" :setting="setting.options.xAxis" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <YAxisTab :query="query" :setting="setting.options.yAxis" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <ColorTab :setting="setting.options.themeColor" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <DataLabelTab :setting="setting.options.plotOptions" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <ShapeTab :setting="setting.options.plotOptions" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <BackgroundTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <TooltipTab :setting="setting.options.tooltip" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <VisualHeader :widget-type="currentWidget" :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LegendTab from '@/shared/Settings/SeriesChart/LegendTab.vue';
import TitleTab from '@/shared/Settings/Common/Tabs/TitleTab.vue';
import BackgroundTab from '@/shared/Settings/Common/Tabs/BackgroundTab.vue';
import DataLabelTab from '@/shared/Settings/SeriesChart/DataLabelTab.vue';
import ShapeTab from '@/shared/Settings/SeriesChart/ShapeTab.vue';
import ColorTab from '@/shared/Settings/Common/Tabs/ColorTab.vue';
import VisualHeader from '@/shared/Settings/Common/Tabs/VisualHeader.vue';
import XAxisTab from '@/shared/Settings/Common/Tabs/XAxisTab.vue';
import YAxisTab from '@/shared/Settings/Common/Tabs/YAxisTab.vue';
import { ParetoQuerySetting, ParetoVizSetting } from '@core/domain';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import TooltipTab from '@/shared/Settings/Common/Tabs/TooltipTab.vue';
import { WidgetType } from '@/shared';

@Component({
  components: {
    LegendTab,
    TitleTab,
    BackgroundTab,
    DataLabelTab,
    ShapeTab,
    ColorTab,
    VisualHeader,
    XAxisTab,
    YAxisTab,
    TooltipTab
  }
})
export default class ParetoSetting extends Vue {
  private get query(): ParetoQuerySetting {
    return QueryBuilderStoreModule.getQuerySetting() as ParetoQuerySetting;
  }

  private get setting(): ParetoVizSetting {
    return QueryBuilderStoreModule.getSettingBloc().getVizSetting() as ParetoVizSetting;
  }

  private handleSettingChanged(key: string, value: boolean | string | number) {
    QueryBuilderStoreModule.getSettingBloc().changeSetting(key, value);
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
