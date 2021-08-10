import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { SettingItem, TabItem } from '@/shared/models';
import { ListUtils } from '@/utils';
import { VizSetting } from '@core/domain/Model';
import { SettingItemType } from '@/shared';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export class TreeMapPanelHandler implements PanelHandler {
  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    const tabs = Array.from(currentTabs);
    const colorTab: TabItem = tabs[1];
    this.bindTreeMapResponseToColorTab(colorTab);
    return tabs;
  }

  onSettingChanged(currentTabs: TabItem[], oldTabs: TabItem[]): void {
    //Nothing to do
  }

  async onChangeSetting(settingKey: string, value: any): Promise<void> {
    //
  }

  private bindTreeMapResponseToColorTab(tab: TabItem) {
    tab.removeDynamicKey('palette_');
    const paletteColors: SettingItem[] = VizSetting.DEFAULT_PALETTE_COLOR?.map((_, i) => {
      return new SettingItem(
        `palette_${i}`,
        `Color at ${i + 1} in  palette`,
        ListUtils.getElementCycleList(VizSetting.DEFAULT_PALETTE_COLOR, i),
        SettingItemType.color,
        `paletteColors[${i}]`,
        []
      );
    });
    tab.settingItems?.push(...paletteColors);
  }
}
