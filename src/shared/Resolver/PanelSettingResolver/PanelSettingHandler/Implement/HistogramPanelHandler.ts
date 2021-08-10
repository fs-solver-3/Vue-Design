import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { TabItem } from '@/shared/models';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export class HistogramPanelHandler implements PanelHandler {
  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    return currentTabs;
  }

  onSettingChanged(currentTabs: TabItem[], oldTabs: TabItem[]): void {
    //
  }

  async onChangeSetting(settingKey: string, value: any): Promise<void> {
    switch (settingKey) {
      case 'bins_number': {
        QueryBuilderStoreModule.setBinsNumber(value);
        await QueryBuilderStoreModule.buildQueryAndRenderVizPanel(true);
        break;
      }
      default:
        return;
    }
  }
}
