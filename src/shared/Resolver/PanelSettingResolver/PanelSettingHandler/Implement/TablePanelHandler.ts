import { SettingItem, TabItem } from '@/shared/models';
import { ChartUtils, ListUtils } from '@/utils';
import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { cloneDeep } from 'lodash';
import { TableColumn, TableQueryChartSetting } from '@core/domain/Model';
import { TablePanelUtils } from '@/utils/TablePanelUtils';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export class TablePanelHandler implements PanelHandler {
  private static readonly PALLET_COLOR_TAB_INDEX = 1;

  private static readonly DEFAULT_COLOR_TAB = new TabItem('color_formatter', 'Color values', []);

  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    const tabs: TabItem[] = cloneDeep(currentTabs);
    this.buildValueColorConfigs(tabs, currentData);
    return tabs;
  }

  onSettingChanged(currentTabs: TabItem[], oldTabs: TabItem[]): void {
    //Nothing to do
  }

  async onChangeSetting(settingKey: string, value: any): Promise<void> {
    //
  }

  private buildValueColorConfigs(tabs: TabItem[], currentData: CurrentSettingData): void {
    const finalTab: TabItem = this.createTabColor(currentData);

    if (finalTab.hasItem) {
      tabs.splice(TablePanelHandler.PALLET_COLOR_TAB_INDEX, 1, finalTab);
    } else {
      tabs.splice(TablePanelHandler.PALLET_COLOR_TAB_INDEX, 1);
    }
  }

  private createTabColor(data: CurrentSettingData): TabItem {
    const tab: TabItem = cloneDeep(TablePanelHandler.DEFAULT_COLOR_TAB);
    const { query } = data;
    if (TableQueryChartSetting.isTableChartSetting(query) && ListUtils.isNotEmpty(query.columns)) {
      const settingItems: SettingItem[] = this.createMultiSettingPalletColor(query.columns);
      tab.addItems(settingItems);
    }
    return tab;
  }

  private createMultiSettingPalletColor(columns: TableColumn[]): SettingItem[] {
    return ChartUtils.findTableColumnIsNumber(columns).map((column, index) => TablePanelUtils.createSettingValueColor(column, index));
  }
}
