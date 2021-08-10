import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { SettingItem, TabItem } from '@/shared/models';
import { SeriesOneResponse } from '@core/domain/Response';
import { SettingItemType } from '@/shared';
import { ChartSettingUtils } from '@/utils';
import { camelCase } from 'lodash';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';
import { StringUtils } from '@/utils/string.utils';

export class StackingPanelHandler implements PanelHandler {
  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    const { response } = currentData;
    const tabs = Array.from(currentTabs);
    const axisTab: TabItem = tabs[1];
    ChartSettingUtils.bindAxisSetting(axisTab, currentData);
    ChartSettingUtils.bindDualAxisSetting(axisTab, currentData);
    ChartSettingUtils.bindResponseSeriesTab(tabs[2], currentData);
    this.bindResponseToStackingTab(tabs[4], currentData);
    return tabs;
  }

  onSettingChanged(currentTabs: TabItem[], oldTabs: TabItem[]): void {
    //Nothing to do
  }

  async onChangeSetting(settingKey: string, value: any): Promise<void> {
    //
  }

  /**
   * Build Stacking group setting dựa trên query and response
   *
   * B1: Lấy yAxis trong query làm Group (yAxis: [Cost, Profit, Revenue] => Group 0: Cost, Group 1: Profit, Group 2: Revenue
   *
   * B2: Spit name của Series trong response để lấy name của group tương ứng
   * (có breakdown: <b>Online - Cost</b> <=> <b>Breakdown</b> - <u>Group Name</u>, không có breakdown: <b>Cost</b> <=> <u>Group Name</u>)
   *
   * B3: Key của group với Series sẽ lấy index của group name ở B1 (Online - Cost => stack_group_0)
   * @param tab
   * @param currentData
   * @private
   */
  private bindResponseToStackingTab(tab: TabItem, currentData: CurrentSettingData) {
    const { response, query } = currentData;
    const currentStackingKeys: string[] = tab.settingItems.map(item => item.key).filter(value => value.startsWith('stacking_'));
    currentStackingKeys.forEach(key => {
      tab.removeItem(key);
    });

    const stackingGroup: SettingItem[] =
      (response as SeriesOneResponse).series?.map((item, i) => {
        const { name, stack } = item;
        const normalizedLabel = StringUtils.toCamelCase(name);
        return new SettingItem(`stacking_${i}`, `Group "${name}"`, `${stack}`, SettingItemType.input, `stackingGroup.${normalizedLabel}`, []);
      }) ?? [];
    tab.settingItems?.push(...stackingGroup);
  }
}
