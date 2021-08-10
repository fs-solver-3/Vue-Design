import { SeriesOneResponse } from '@core/domain/Response';
import { SettingItem, TabItem } from '@/shared/models';
import { SettingItemType } from '@/shared';
import { ChartSettingUtils } from '@/utils';
import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export class ParetoPanelHandler implements PanelHandler {
  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    const { response } = currentData;
    const tabs = Array.from(currentTabs);
    const axisTab: TabItem = tabs[1];
    ChartSettingUtils.bindAxisSetting(axisTab, currentData);
    const seriesTab: TabItem = tabs[2];
    this.bindResponseToSeriesTab(seriesTab, response as SeriesOneResponse);
    return tabs;
  }

  onSettingChanged(currentTabs: TabItem[], oldTabs: TabItem[]): void {
    //Nothing to do
  }

  async onChangeSetting(settingKey: string, value: any): Promise<void> {
    //
  }

  private bindResponseToSeriesTab(seriesTab: TabItem, newData: SeriesOneResponse): TabItem {
    seriesTab.removeItem('pareto_index');
    if ((newData?.series?.length ?? 0) > 1) {
      const paretoSelect: SettingItem = new SettingItem(
        `pareto_index`,
        `Legend to display Pareto`,
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
      seriesTab?.settingItems?.push(paretoSelect);
    }
    return seriesTab;
  }
}
