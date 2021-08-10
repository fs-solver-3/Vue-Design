import { VizSetting } from '@core/domain/Model';
import { TabItem } from '@/shared/models';
import { WidgetType } from '@/shared';
import { Log } from '@core/utils';
import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export class PanelSettingResolver {
  constructor(private creators: Map<string, PanelHandler>) {}

  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    const creator = this.creators.get(currentData.widgetType);
    return creator?.onResponseChanged(currentTabs, currentData) ?? currentTabs;
  }

  onSettingChanged(setting: VizSetting, currentTabs: TabItem[], oldTabs: TabItem[]): void {
    const creator = this.creators.get(setting.className);
    return creator?.onSettingChanged(currentTabs, oldTabs);
  }

  onChangeSetting(payload: { type: WidgetType; settingKey: string; value: any }): Promise<void> {
    const { type, settingKey, value } = payload;
    const creator = this.creators.get(type);
    if (!creator) {
      Log.error('Not found handler for widget type:: ' + type);
    }
    return creator?.onChangeSetting(settingKey, value) ?? Promise.resolve();
  }
}
