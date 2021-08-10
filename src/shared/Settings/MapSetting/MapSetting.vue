<template>
  <div class="overflow-auto flex-grow-1">
    <TitleTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <!--    <MapControlTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />-->
    <MapStyleTab
      :setting="setting.options"
      @onChanged="handleSettingChanged"
      @onMultipleChanged="handleMultipleSettingChanged"
      @onChangeAndQuery="handleSettingChangeAndQuery"
    />
    <HeatMapColorTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <TooltipTab :setting="setting.options.tooltip" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <BackgroundTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <VisualHeader :widget-type="currentWidget" :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { MapChartVizSetting, MapQuerySetting } from '@core/domain';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import TitleTab from '@/shared/Settings/Common/Tabs/TitleTab.vue';
import BackgroundTab from '@/shared/Settings/Common/Tabs/BackgroundTab.vue';
import VisualHeader from '@/shared/Settings/Common/Tabs/VisualHeader.vue';
import MapControlTab from '@/shared/Settings/MapSetting/MapControlTab.vue';
import MapStyleTab from '@/shared/Settings/MapSetting/MapStyleTab.vue';
import HeatMapColorTab from '@/shared/Settings/HeatMapSetting/HeatMapColorTab.vue';
import TooltipTab from '@/shared/Settings/Common/Tabs/TooltipTab.vue';
import { WidgetType } from '@/shared';

@Component({
  components: {
    TitleTab,
    BackgroundTab,
    VisualHeader,
    MapControlTab,
    MapStyleTab,
    HeatMapColorTab,
    TooltipTab
  }
})
export default class MapSetting extends Vue {
  private get query(): MapQuerySetting {
    return QueryBuilderStoreModule.getQuerySetting() as MapQuerySetting;
  }

  private get setting(): MapChartVizSetting {
    return QueryBuilderStoreModule.getSettingBloc().getVizSetting() as MapChartVizSetting;
  }

  private handleSettingChanged(key: string, value: boolean | string | number) {
    QueryBuilderStoreModule.getSettingBloc().changeSetting(key, value);
  }

  private handleMultipleSettingChanged(settings: Map<SettingKey, boolean | string | number>) {
    QueryBuilderStoreModule.getSettingBloc().multiChangeSetting(settings);
  }

  private handleSettingChangeAndQuery(key: string, value: boolean | string | number) {
    QueryBuilderStoreModule.getSettingBloc().changeSetting(key, value, true);
  }
  private get currentWidget(): WidgetType {
    return QueryBuilderStoreModule.itemSelected.type as WidgetType;
  }
}
</script>

<style lang="scss" scoped></style>
