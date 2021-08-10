<template>
  <div class="overflow-auto flex-grow-1">
    <TitleTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <DataPointTab :setting="setting.options" @onChangeAndQuery="handleSettingChangeAndQuery" />
    <LegendTab :setting="setting.options.legend" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <BellXAxisTab :query="query" :setting="setting.options.xAxis" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <BellYAxisTab :query="query" :setting="setting.options.yAxis" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <BellCurveColorTab :setting="setting.options.themeColor" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <DataLabelTab :setting="setting.options.plotOptions" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <ShapeTab :setting="setting.options.plotOptions" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <BackgroundTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <TooltipTab :setting="setting.options.tooltip" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <VisualHeader :setting="setting.options" :widget-type="currentWidget" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LegendTab from '@/shared/Settings/SeriesChart/LegendTab.vue';
import TitleTab from '@/shared/Settings/Common/Tabs/TitleTab.vue';
import BackgroundTab from '@/shared/Settings/Common/Tabs/BackgroundTab.vue';
import DataLabelTab from '@/shared/Settings/SeriesChart/DataLabelTab.vue';
import ShapeTab from '@/shared/Settings/SeriesChart/ShapeTab.vue';
import VisualHeader from '@/shared/Settings/Common/Tabs/VisualHeader.vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import { BellCurve2QuerySetting, BellCurve2VizSetting } from '@core/domain';
import TooltipTab from '@/shared/Settings/Common/Tabs/TooltipTab.vue';
import { WidgetType } from '@/shared';
import BellCurveColorTab from '@/shared/Settings/BellCurveSetting/BellCuveColorTab.vue';
import DataPointTab from '@/shared/Settings/Common/Tabs/DataPointTab.vue';
import BellXAxisTab from '@/shared/Settings/BellCurveSetting/BellCurveXAxisTab.vue';
import BellYAxisTab from '@/shared/Settings/BellCurveSetting/BellYAxisTab.vue';

@Component({
  components: {
    LegendTab,
    TitleTab,
    BackgroundTab,
    DataLabelTab,
    ShapeTab,
    BellCurveColorTab,
    VisualHeader,
    BellXAxisTab,
    TooltipTab,
    DataPointTab,
    BellYAxisTab
  }
})
export default class BellCurveSetting extends Vue {
  private get query(): BellCurve2QuerySetting {
    return QueryBuilderStoreModule.getQuerySetting() as BellCurve2QuerySetting;
  }

  private get setting(): BellCurve2VizSetting {
    return QueryBuilderStoreModule.getSettingBloc().getVizSetting() as BellCurve2VizSetting;
  }

  private get currentWidget(): WidgetType {
    return QueryBuilderStoreModule.itemSelected.type as WidgetType;
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
}
</script>

<style lang="scss" scoped></style>
