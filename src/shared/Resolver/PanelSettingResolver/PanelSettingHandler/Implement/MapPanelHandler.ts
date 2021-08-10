import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';
import { SettingItem, TabItem } from '@/shared/models';
import { MapResponse } from '@core/domain/Response';
import { GeolocationModule } from '@/store/modules/data_builder/geolocation.store';
import { SelectOption, SettingItemType } from '@/shared';
import { DataModule } from '@/screens/DashboardDetail/stores/controller/DataStore';
import { VizSettingModule } from '@/store/modules/data_builder/viz_setting.store';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { CurrentSettingData } from '@/shared/Resolver/PanelSettingResolver/CurrentSettingData';

export class MapPanelHandler implements PanelHandler {
  static normalizedKey = 'normalize_';
  static areaKey = 'area_select';
  static defaultMapIndex = 0;

  onResponseChanged(currentTabs: TabItem[], currentData: CurrentSettingData): TabItem[] {
    const tabs = Array.from(currentTabs);
    const mapTab = tabs[3];
    this.bindGeoDataToMapTab(mapTab, currentData.response as MapResponse);
    return tabs;
  }

  onSettingChanged(currentTabs: TabItem[], oldTabs: TabItem[]): void {
    //Nothing to do
  }

  async onChangeSetting(settingKey: string, value: any): Promise<void> {
    switch (settingKey) {
      case MapPanelHandler.areaKey:
        await this.selectArea(value);
        break;
    }

    if (settingKey.startsWith(MapPanelHandler.normalizedKey)) {
      await this.bindLocationToQuery(settingKey, value);
      // await QueryBuilderStoreModule.buildQueryAndRenderVizPanel(true);
    }
  }

  private bindGeoDataToMapTab(tab: TabItem, data: MapResponse) {
    if (!tab.getItem(MapPanelHandler.areaKey)) {
      const options = Array.from(GeolocationModule.areaAsMap.values()).map<SelectOption>(area => ({
        id: area.mapUrl,
        displayName: area.displayName
      }));
      const areaSelectSetting: SettingItem = new SettingItem(
        MapPanelHandler.areaKey,
        'Select map',
        options[MapPanelHandler.defaultMapIndex].id,
        SettingItemType.selection,
        'geoArea',
        options
      );
      tab.settingItems?.push(areaSelectSetting);
    }
    // const haveMap = tab.getItem(MapPanelHandler.areaKey)?.value != 'none';
    // if (haveMap) {
    //   tab.removeDynamicKey(MapPanelHandler.normalizedKey);
    //   const defaultOption = {
    //     id: 'unknown',
    //     displayName: 'Unknown'
    //   };
    //   const area = tab.getItem(MapPanelHandler.areaKey)?.value;
    //   // const locationOptions =
    //   //   GeolocationModule.geolocationAsMap.get(area)?.map(location => ({
    //   //     id: location.code,
    //   //     displayName: location.name
    //   //   })) ?? [];
    //   const locationNormalized = new Set(data.data.map(item => item.code));
    //   const locationUnNormalize =
    //     GeolocationModule.geolocationAsMap
    //       .get(area)
    //       ?.filter(location => !locationNormalized.has(location.code))
    //       ?.map(location => ({
    //         id: location.code,
    //         displayName: location.name
    //       })) ?? [];
    //
    //   const settings: SettingItem[] = [...data.unknownData].map(location => {
    //     const value = GeolocationModule.locationMatchedAsMap.get(location.name) ?? defaultOption.id;
    //     return new SettingItem(`${MapPanelHandler.normalizedKey}${location.name}`, `Normalize ${location.name}`, value, SettingItemType.selection, '', [
    //       defaultOption,
    //       ...locationUnNormalize
    //     ]);
    //   });
    //   tab.settingItems?.push(...settings);
    // }
  }

  private async bindLocationToQuery(settingKey: string, value: any): Promise<void> {
    const geoCode = settingKey.replace(MapPanelHandler.normalizedKey, '');
    GeolocationModule.updateLocationMatching({ key: geoCode, value: value });
  }

  private async selectArea(value: any): Promise<void> {
    GeolocationModule.saveCurrentArea(value);
    await GeolocationModule.loadListGeolocationWithCode({ code: value });
    await QueryBuilderStoreModule.buildQueryAndRenderVizPanel(true);
  }
}
