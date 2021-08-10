import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared';
import { Geolocation } from '@core/domain/Model/Geolocation/Geolocation';
import { Inject } from 'typescript-ioc';
import { GeolocationService } from '@core/services';
import { MapResponse } from '@core/domain/Response';
import { ChartInfo, MapQuerySetting, QuerySettingType } from '@core/domain/Model';
import { JsonUtils } from '@core/utils';
import { GeoArea } from '@core/domain/Model/Geolocation/GeoArea';

export interface GeolocationState {
  areaAsMap: Map<string, GeoArea>;
  geolocationAsMap: Map<string, Geolocation[]>;
  areaSelected: string;
  normalizedNameMap: Map<string, string>;
}

@Module({ store: store, name: Stores.geolocationStore, dynamic: true, namespaced: true })
class GeolocationStore extends VuexModule {
  areaAsMap: GeolocationState['areaAsMap'] = new Map<string, GeoArea>();
  geolocationAsMap: GeolocationState['geolocationAsMap'] = new Map<string, Geolocation[]>();
  areaSelected: GeolocationState['areaSelected'] | null = null;
  locationMatchedAsMap: GeolocationState['normalizedNameMap'] = new Map<string, string>();

  @Inject
  private readonly geoService!: GeolocationService;

  @Action({ commit: 'saveArea' })
  async loadGeolocationMap(): Promise<GeoArea[]> {
    const areas = await this.geoService.listAreas();
    const areaSelected = areas[0];
    this.saveCurrentArea(areaSelected.mapUrl);
    await this.loadListGeolocation(areaSelected);
    return areas;
  }

  @Mutation
  saveArea(areas: GeoArea[]): void {
    this.areaAsMap = new Map(areas.map(area => [area.mapUrl, area]));
  }

  @Mutation
  saveCurrentArea(area: string): void {
    this.areaSelected = area;
  }

  @Action
  async loadListGeolocationWithCode(payload: { code: string }): Promise<Geolocation[]> {
    const { code } = payload;
    const area = this.areaAsMap.get(code);
    if (area) {
      return this.loadListGeolocation(area);
    }
    return Promise.resolve([]);
  }

  @Action
  async loadListGeolocation(area: GeoArea): Promise<Geolocation[]> {
    const list = await this.geoService.list(area);
    this.saveGeolocation({ code: area.mapUrl, locations: list });
    return list;
  }

  @Mutation
  saveGeolocation(payload: { code: string; locations: Geolocation[] }): void {
    const { code, locations } = payload;
    this.geolocationAsMap.set(code, locations);
  }

  @Mutation
  setNormalizedName(normalizeMap: Map<string, string>): void {
    this.locationMatchedAsMap = new Map(normalizeMap);
  }

  @Mutation
  updateLocationMatching(payload: { key: string; value: string }): void {
    const { key, value } = payload;
    this.locationMatchedAsMap.set(key, value);
  }

  @Mutation
  initNormalizeName(data: MapResponse): void {
    this.locationMatchedAsMap = new Map(data.unknownData.map(unknownData => [unknownData.name, unknownData.code]));
  }

  @Action
  async loadGeolocationFromWidget(widget: ChartInfo): Promise<void> {
    const isMapQuery: boolean = widget.setting.className == QuerySettingType.Map;
    if (isMapQuery) {
      const normalizeObject = JsonUtils.fromPureJson((widget.setting as MapQuerySetting).normalizedNameMap);
      this.setNormalizedName(new Map(Object.entries(normalizeObject)));
      this.saveCurrentArea((widget.setting as MapQuerySetting).geoArea?.mapUrl ?? '');
    }
  }

  @Mutation
  reset(): void {
    this.geolocationAsMap.clear();
    this.areaSelected = null;
    this.areaAsMap.clear();
    this.locationMatchedAsMap.clear();
  }
}

export const GeolocationModule = getModule(GeolocationStore);
