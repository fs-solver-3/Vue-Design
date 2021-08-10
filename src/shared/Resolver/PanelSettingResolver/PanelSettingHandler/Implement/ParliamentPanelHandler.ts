import { TabItem } from '@/shared/models';
import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export class ParliamentPanelHandler implements PanelHandler {
  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    return currentTabs;
  }

  onSettingChanged(currentTabs: TabItem[], oldTabs: TabItem[]): void {
    //Nothing to do
  }

  async onChangeSetting(settingKey: string, value: any): Promise<void> {
    //
  }
}
