import { TabItem } from '@/shared/models';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export abstract class PanelHandler {
  /**
   * Tạo ra tab tương ứng với response hiện tại, tab này sẽ hiện trong
   * @param currentTabs: tab đang được hiện
   * @param currentDatasetting: data được trả về
   */
  abstract onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[];

  abstract onSettingChanged(currentTabs: TabItem[], oldTabs: TabItem[]): void;

  abstract onChangeSetting(settingKey: string, value: any): Promise<void>;
}
