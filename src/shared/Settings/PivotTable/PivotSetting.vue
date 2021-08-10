<template>
  <div class="overflow-auto flex-grow-1">
    <TitleTab :setting="setting.options" widget-type="pivot_table" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <StyleTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <GridTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <HeaderTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <ValuesTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <CollapseTab v-if="enableCollapseTab" :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <TotalTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <FieldFormattingTab :columns="formattingColumns" :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <ConditionalFormattingTab
      v-if="hasFormattingTab"
      :canShowDataBar="canShowDataBar"
      :columns="conditionalFormattingColumns"
      :functionType="functionType"
      :options="setting.options"
      @onChanged="handleSettingChanged"
      @onClearSetting="handleClearSetting"
      @onMultipleChanged="handleMultipleSettingChanged"
    />
    <BackgroundTab :setting="setting.options" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <TooltipTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <VisualHeader :setting="setting.options" :widget-type="currentWidget" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GridTab from './GridTab.vue';
import HeaderTab from '@/shared/Settings/PivotTable/HeaderTab.vue';
import ValuesTab from '@/shared/Settings/PivotTable/ValuesTab.vue';
import StyleTab from '@/shared/Settings/PivotTable/StyleTab.vue';
import TotalTab from '@/shared/Settings/PivotTable/TotalTab.vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import TitleTab from '@/shared/Settings/Common/Tabs/TitleTab.vue';
import BackgroundTab from '@/shared/Settings/Common/Tabs/BackgroundTab.vue';
import VisualHeader from '@/shared/Settings/Common/Tabs/VisualHeader.vue';
import FieldFormattingTab from '@/shared/Settings/PivotTable/FieldFormattingTab.vue';
import { PivotTableQuerySetting, PivotTableVizSetting, TableColumn } from '@core/domain';
import { RemoveContainsKey, SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import TooltipTab from '@/shared/Settings/PivotTable/TooltipTab.vue';
import CollapseTab from '@/shared/Settings/PivotTable/CollapseTab.vue';
import ConditionalFormattingTab from '@/shared/Settings/Table/ConditionalFormattingTab.vue';
import { WidgetType } from '@/shared';
import { PivotFieldFormatterUtils } from '@chart/Table/PivotTable/Style/PivotFieldFormatterUtils';
import { PivotFormatAs } from '@chart/Table/PivotTable/Style/PivotFormatAs';
import { ChartUtils, ListUtils } from '@/utils';
import TableSetting from '@/shared/Settings/Table/TableSetting.vue';
import { FunctionFormattingType } from '@/shared/Settings/Common/ConditionalFormatting/FormattingOptions';

@Component({
  components: {
    GridTab,
    HeaderTab,
    ValuesTab,
    StyleTab,
    TotalTab,
    TitleTab,
    BackgroundTab,
    VisualHeader,
    FieldFormattingTab,
    TooltipTab,
    CollapseTab,
    ConditionalFormattingTab
  }
})
export default class PivotSetting extends Vue {
  private readonly functionType = FunctionFormattingType.GroupBy;

  private get query(): PivotTableQuerySetting {
    return QueryBuilderStoreModule.getQuerySetting() as PivotTableQuerySetting;
  }

  private get setting(): PivotTableVizSetting {
    return QueryBuilderStoreModule.getSettingBloc().getVizSetting() as PivotTableVizSetting;
  }

  private get enableCollapseTab(): boolean {
    return this.query.rows.length > 1;
  }

  private get formattingColumns(): TableColumn[] {
    return [this.query.rows[0], ...this.query.values].filter(column => !!column);
  }

  private get conditionalFormattingColumns(): TableColumn[] {
    const pivotDisplayAs = PivotFieldFormatterUtils.getFormatType(this.query);
    switch (pivotDisplayAs) {
      case PivotFormatAs.Table:
        return this.formattingColumns;
      default:
        return this.query.values.filter(column => !!column);
    }
  }

  private get currentWidget(): WidgetType {
    return QueryBuilderStoreModule.itemSelected.type as WidgetType;
  }

  private handleSettingChanged(key: string, value: boolean | string | number) {
    QueryBuilderStoreModule.getSettingBloc().changeSetting(key, value);
  }

  private handleMultipleSettingChanged(settings: Map<SettingKey, boolean | string | number>, canQuery?: boolean) {
    QueryBuilderStoreModule.getSettingBloc().multiChangeSetting(settings, canQuery === true);
  }

  private handleClearSetting(key: string): void {
    QueryBuilderStoreModule.getSettingBloc().add(new RemoveContainsKey(key));
  }

  private canShowDataBar(selectedColumn: TableColumn): boolean {
    if (selectedColumn) {
      return ChartUtils.isAggregationFunction(selectedColumn.function);
    } else {
      return false;
    }
  }

  private get hasFormattingTab(): boolean {
    return ListUtils.isNotEmpty(this.query.values);
  }
}
</script>
