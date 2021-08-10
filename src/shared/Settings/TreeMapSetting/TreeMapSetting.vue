<template>
  <div class="overflow-auto flex-grow-1">
    <TitleTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <LayoutTab :setting="setting.options.plotOptions" @onChanged="handleSettingChanged" />
    <ColorTab :setting="setting.options.themeColor" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <DataLabelTab
      :query="query"
      :setting="setting.options.plotOptions"
      widget-type="tree_map"
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
import TitleTab from '@/shared/Settings/Common/Tabs/TitleTab.vue';
import BackgroundTab from '@/shared/Settings/Common/Tabs/BackgroundTab.vue';
import ColorTab from '@/shared/Settings/Common/Tabs/ColorTab.vue';
import VisualHeader from '@/shared/Settings/Common/Tabs/VisualHeader.vue';
import { TreeMapQuerySetting, TreeMapVizSetting } from '@core/domain';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import DataLabelTab from '@/shared/Settings/SeriesChart/DataLabelTab.vue';
import { Log } from '@core/utils';
import TooltipTab from '@/shared/Settings/Common/Tabs/TooltipTab.vue';
import LayoutTab from '@/shared/Settings/TreeMapSetting/LayoutTab.vue';
import { WidgetType } from '@/shared';

@Component({
  components: {
    TitleTab,
    BackgroundTab,
    LayoutTab,
    ColorTab,
    VisualHeader,
    DataLabelTab,
    TooltipTab
  }
})
export default class TreeMapSetting extends Vue {
  private get query(): TreeMapQuerySetting {
    return QueryBuilderStoreModule.getQuerySetting() as TreeMapQuerySetting;
  }

  private get setting(): TreeMapVizSetting {
    return QueryBuilderStoreModule.getSettingBloc().getVizSetting() as TreeMapVizSetting;
  }

  private handleSettingChanged(key: string, value: boolean | string | number) {
    if (key == 'plotOptions.treemap.dataLabels.enabled') {
      QueryBuilderStoreModule.getSettingBloc().changeSetting('plotOptions.treemap.levels[0].dataLabels.enabled', value);
    } else if (key == 'plotOptions.treemap.dataLabels.style.color') {
      QueryBuilderStoreModule.getSettingBloc().changeSetting('plotOptions.treemap.levels[0].dataLabels.style.color', value);
    }
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
