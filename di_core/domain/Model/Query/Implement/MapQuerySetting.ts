/*
 * @author: tvc12 - Thien Vi
 * @created: 5/29/21, 4:36 PM
 */

import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import {
  Condition,
  Filterable,
  Function,
  getFiltersAndSorts,
  MapChartVizSetting,
  OrderBy,
  QuerySettingType,
  TableColumn,
  VizSettingType
} from '@core/domain/Model';
import { JsonUtils, Log } from '@core/utils';
import { GeoArea } from '@core/domain/Model/Geolocation/GeoArea';
import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { cloneDeep } from 'lodash';
import { GeolocationModule } from '@/store/modules/data_builder/geolocation.store';

export class MapQuerySetting extends QuerySetting<MapChartVizSetting> implements Filterable {
  readonly className = QuerySettingType.Map;

  constructor(
    public location: TableColumn,
    public value: TableColumn,
    public normalizedNameMap: string,
    public geoArea?: GeoArea,
    filters: Condition[] = [],
    sorts: OrderBy[] = [],
    options: Record<string, any> = {}
  ) {
    super(filters, sorts, options);
  }

  static fromObject(obj: MapQuerySetting): MapQuerySetting {
    const [filters, sorts] = getFiltersAndSorts(obj);
    const location = TableColumn.fromObject(obj.location);
    const value = TableColumn.fromObject(obj.value);
    const geoArea = obj.geoArea ? GeoArea.fromObject(obj.geoArea) : void 0;
    return new MapQuerySetting(location, value, obj.normalizedNameMap, geoArea, filters, sorts, obj.options);
  }

  getAllFunction(): Function[] {
    return [this.location.function, this.value.function];
  }

  setNormalizedMap(normalized: Map<string, string>) {
    this.normalizedNameMap = JsonUtils.toJson(normalized, true);
  }

  setGeoArea(geoArea: GeoArea | undefined) {
    this.geoArea = geoArea;
  }

  getFilter(): TableColumn {
    return this.location;
  }
  //TODO: Fix me => change geolocation value to setting instead of Store
  protected setValueBySetting(setting: VizSetting) {
    const isMapSetting = setting.className == VizSettingType.MapSetting;
    if (isMapSetting) {
      Log.debug('map::setValueBySetting::', setting.options);
      const normalizedNameMap = cloneDeep(GeolocationModule.locationMatchedAsMap);
      const geoArea = GeolocationModule.areaAsMap.get(setting.options.geoArea ?? '');
      this.setGeoArea(geoArea);
      this.setNormalizedMap(normalizedNameMap);
    }
  }
}
