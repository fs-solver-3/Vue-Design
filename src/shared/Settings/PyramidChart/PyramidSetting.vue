<template>
  <div class="overflow-auto flex-grow-1">
    <TitleTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <LegendTab :setting="setting.options.legend" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <ColorTab :setting="setting.options.themeColor" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <DataLabelTab
      :widget-type="widgetType"
      :setting="setting.options.plotOptions"
      @onChanged="handleSettingChanged"
      @onMultipleChanged="handleMultipleSettingChanged"
    />
    <BackgroundTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <TooltipTab :setting="setting.options.tooltip" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <VisualHeader :widget-type="currentWidget" :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { PyramidVizSetting, SeriesQuerySetting } from '@core/domain';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import LegendTab from '@/shared/Settings/SeriesChart/LegendTab.vue';
import VisualHeader from '@/shared/Settings/Common/Tabs/VisualHeader.vue';
import BackgroundTab from '@/shared/Settings/Common/Tabs/BackgroundTab.vue';
import TitleTab from '@/shared/Settings/Common/Tabs/TitleTab.vue';
import ColorTab from '@/shared/Settings/Common/Tabs/ColorTab.vue';
import DataLabelTab from '@/shared/Settings/SeriesChart/DataLabelTab.vue';
import { WidgetType } from '@/shared';
import TooltipTab from '@/shared/Settings/Common/Tabs/TooltipTab.vue';

@Component({ components: { TooltipTab, DataLabelTab, LegendTab, TitleTab, BackgroundTab, ColorTab, VisualHeader } })
export default class PyramidSetting extends Vue {
  private readonly widgetType = WidgetType.pyramid;

  private get query(): SeriesQuerySetting {
    return QueryBuilderStoreModule.getQuerySetting() as SeriesQuerySetting;
  }

  private get setting(): PyramidVizSetting {
    return QueryBuilderStoreModule.getSettingBloc().getVizSetting() as PyramidVizSetting;
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
