<template>
  <div class="overflow-auto flex-grow-1">
    <FilterTitleTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <TabFilterControlTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <BackgroundTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { TabFilterVizSetting } from '@core/domain';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import BackgroundTab from '@/shared/Settings/Common/Tabs/BackgroundTab.vue';
import TabFilterControlTab from '@/shared/Settings/TabFilterSetting/TabFilterControlTab.vue';
import FilterTitleTab from '@/shared/Settings/TabFilterSetting/FilterTitleTab.vue';

@Component({
  components: {
    FilterTitleTab,
    BackgroundTab,
    TabFilterControlTab
  }
})
export default class TabFilterSetting extends Vue {
  private get setting(): TabFilterVizSetting {
    return QueryBuilderStoreModule.getSettingBloc().getVizSetting() as TabFilterVizSetting;
  }

  private handleSettingChanged(key: string, value: boolean | string | number) {
    QueryBuilderStoreModule.getSettingBloc().changeSetting(key, value);
  }

  private handleMultipleSettingChanged(settings: Map<SettingKey, boolean | string | number>) {
    QueryBuilderStoreModule.getSettingBloc().multiChangeSetting(settings);
  }
}
</script>

<style lang="scss" scoped></style>
