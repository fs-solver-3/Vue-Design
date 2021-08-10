import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { TabItem } from '@/shared/models';
import { ChartSettingUtils } from '@/utils';
import { Log } from '@core/utils';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export class ScatterPanelHandler implements PanelHandler {
  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    const tabs = Array.from(currentTabs);
    const axisTab: TabItem = tabs[1];
    ChartSettingUtils.bindAxisSetting(axisTab, currentData);
    Log.debug('ScatterPanelHandler', axisTab);
    return tabs;
  }

  onSettingChanged(currentTabs: TabItem[], oldTabs: TabItem[]): void {
    //Nothing to do
  }

  async onChangeSetting(settingKey: string, value: any): Promise<void> {
    switch (settingKey) {
      case 'num_data_point': {
        await DataBuilderModule.applySetting();
        await QueryBuilderStoreModule.renderPreviewWidget(true);
        break;
      }
    }
  }
}
