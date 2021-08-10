<template>
  <div class="overflow-auto flex-grow-1">
    <TitleTab :setting="setting.options" widget-type="table" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <StyleTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <GridTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <HeaderTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <ValuesTab :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <CollapseTab v-if="enableCollapseTab" :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <FieldFormattingTab :columns="columns" :setting="setting" @onChanged="handleSettingChanged" @onMultipleChanged="handleMultipleSettingChanged" />
    <ConditionalFormattingTab
      :canShowDataBar="canShowDataBar"
      :columns="columns"
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
import HeaderTab from '@/shared/Settings/PivotTable/HeaderTab.vue';
import ValuesTab from '@/shared/Settings/PivotTable/ValuesTab.vue';
import StyleTab from '@/shared/Settings/PivotTable/StyleTab.vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import TitleTab from '@/shared/Settings/Common/Tabs/TitleTab.vue';
import BackgroundTab from '@/shared/Settings/Common/Tabs/BackgroundTab.vue';
import VisualHeader from '@/shared/Settings/Common/Tabs/VisualHeader.vue';
import { AbstractTableQuerySetting, FunctionType, TableColumn, TableVizSetting } from '@core/domain';
import { RemoveContainsKey, SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import TooltipTab from '@/shared/Settings/PivotTable/TooltipTab.vue';
import GridTab from '@/shared/Settings/PivotTable/GridTab.vue';
import ConditionalFormattingTab from '@/shared/Settings/Table/ConditionalFormattingTab.vue';
import { ChartUtils } from '@/utils';
import FieldFormattingTab from '@/shared/Settings/PivotTable/FieldFormattingTab.vue';
import CollapseTab from '@/shared/Settings/PivotTable/CollapseTab.vue';
import { WidgetType } from '@/shared';
import { FunctionFormattingType } from '@/shared/Settings/Common/ConditionalFormatting/FormattingOptions';

@Component({
  components: {
    GridTab,
    HeaderTab,
    ValuesTab,
    StyleTab,
    TitleTab,
    BackgroundTab,
    VisualHeader,
    TooltipTab,
    ConditionalFormattingTab,
    FieldFormattingTab,
    CollapseTab
  }
})
export default class TableSetting extends Vue {
  private get functionType(): FunctionFormattingType {
    return ChartUtils.hasOnlyNoneFunction(this.query.columns) ? FunctionFormattingType.None : FunctionFormattingType.GroupBy;
  }

  private get setting(): TableVizSetting {
    return QueryBuilderStoreModule.getSettingBloc().getVizSetting() as TableVizSetting;
  }

  private get query(): AbstractTableQuerySetting {
    return QueryBuilderStoreModule.getQuerySetting() as AbstractTableQuerySetting;
  }

  private get columns(): TableColumn[] {
    switch (this.functionType) {
      case FunctionFormattingType.GroupBy:
        return [...this.pickFirstGroupBy(this.query.columns), ...this.pickAggregationFunctions(this.query.columns)];
      default:
        return this.query.columns;
    }
  }

  private get enableCollapseTab(): boolean {
    const groupBys = this.query.columns.filter(column => ChartUtils.isGroupByFunction(column.function));
    return groupBys.length > 1;
  }

  private get currentWidget(): WidgetType {
    return QueryBuilderStoreModule.itemSelected.type as WidgetType;
  }

  private canShowDataBar(selectedColumn: TableColumn): boolean {
    if (selectedColumn) {
      if (ChartUtils.hasOnlyNoneFunction(this.query.columns)) {
        return ChartUtils.isColumnNumber(selectedColumn);
      } else {
        return ChartUtils.isAggregationFunction(selectedColumn.function);
      }
    } else {
      return false;
    }
  }

  private handleSettingChanged(key: string, value: boolean | string | number) {
    QueryBuilderStoreModule.getSettingBloc().changeSetting(key, value);
  }

  private handleMultipleSettingChanged(settings: Map<SettingKey, boolean | string | number>, canQuery?: boolean) {
    QueryBuilderStoreModule.getSettingBloc().multiChangeSetting(settings, canQuery === true);
  }

  private pickFirstGroupBy(tableColumns: TableColumn[]): TableColumn[] {
    const tableColumn = tableColumns.find(column => column.function.className === FunctionType.Group);
    if (tableColumn) {
      return [tableColumn];
    } else {
      return [];
    }
  }

  private pickAggregationFunctions(tableColumns: TableColumn[]) {
    return tableColumns.filter(column => ChartUtils.isAggregationFunction(column.function));
  }

  private handleClearSetting(key: string): void {
    QueryBuilderStoreModule.getSettingBloc().add(new RemoveContainsKey(key));
  }
}
</script>
