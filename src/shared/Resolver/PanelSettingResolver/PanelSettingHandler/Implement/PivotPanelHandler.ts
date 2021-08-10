import { SettingItem, TabItem } from '@/shared/models';
import { ListUtils } from '@/utils';
import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { cloneDeep } from 'lodash';
import { PivotTableQuerySetting, TableColumn } from '@core/domain/Model';
import { TablePanelUtils } from '@/utils/TablePanelUtils';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export class PivotPanelHandler implements PanelHandler {
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

  private createTabColor(data: CurrentSettingData): TabItem {
    const { query } = data;
    const tab: TabItem = cloneDeep(PivotPanelHandler.DEFAULT_COLOR_TAB);
    if (PivotTableQuerySetting.isPivotChartSetting(query) && ListUtils.isNotEmpty(query.values)) {
      const settingItems: SettingItem[] = this.createMultiSettingPalletColor(query.values);
      tab.addItems(settingItems);
    }
    return tab;
  }

  private createMultiSettingPalletColor(values: TableColumn[]): SettingItem[] {
    return values.map((column: TableColumn, index: number) => TablePanelUtils.createSettingValueColor(column, index));
  }

  private buildValueColorConfigs(tabs: TabItem[], currentData: CurrentSettingData): void {
    const tabColor: TabItem = this.createTabColor(currentData);

    if (tabColor.hasItem) {
      tabs.splice(PivotPanelHandler.PALLET_COLOR_TAB_INDEX, 1, tabColor);
    } else {
      tabs.splice(PivotPanelHandler.PALLET_COLOR_TAB_INDEX, 1);
    }
  }
}
