import { SettingItem, TabItem } from '@/shared/models';
import { ChartSettingUtils } from '@/utils';
import { SeriesTwoResponse } from '@core/domain/Response';
import { SettingItemType } from '@/shared';
import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';

export class BellCurvePanelHandler implements PanelHandler {
  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    const tabs = Array.from(currentTabs);
    const axisTab: TabItem = tabs[1];
    ChartSettingUtils.bindAxisSetting(axisTab, currentData);
    // const seriesTab: TabItem = tabs[2];
    // this.bindBellCurveResponseToAxisTab(seriesTab, currentData.response as SeriesTwoResponse);
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

  private bindBellCurveResponseToAxisTab(tab: TabItem, newData: SeriesTwoResponse): TabItem {
    tab.removeItem('bell_curve_index');
    if ((newData?.series?.length ?? 0) > 1) {
      //TODO:Bell Curve => add setting to tab
      const bellCurveSelect: SettingItem = new SettingItem(
        `bell_curve_index`,
        `Legend to display BellCurve`,
        0,
        SettingItemType.selection,
        `baseTypes`,
        newData.series.map((legend, index) => {
          return {
            id: index,
            displayName: legend.name
          };
        })
      );
    }
    return tab;
  }
}
