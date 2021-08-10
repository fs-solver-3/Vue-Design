import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ObjectUtils } from '@core/utils';
import { cloneDeep } from 'lodash';
import { TreeMapSettingBloc } from '@/shared/Settings/TreeMapSetting/TreeMapSettingBloc';

export class TreeMapSettingBlocCreator implements SettingBlocCreator<TreeMapSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): TreeMapSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new TreeMapSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): TreeMapSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new TreeMapSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): SeriesVizData {
    return {
      title: {
        align: 'center',
        enabled: true,
        text: 'Untitled chart',
        style: {
          color: '#ffffff',
          fontFamily: 'Barlow',
          fontSize: '20px'
        }
      },
      subtitle: {
        align: 'center',
        enabled: true,
        text: '',
        style: {
          color: '#ffffff',
          fontFamily: 'Barlow',
          fontSize: '20px'
        }
      },
      affectedByFilter: true,
      themeColor: { enabled: true },
      background: '#0000001A',
      plotOptions: {
        treemap: {
          dataLabels: {
            enabled: true
          },
          levels: [
            {
              level: 1
            }
          ]
        }
      }
    };
  }

  private getOldSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = cloneDeep(data.oldBloc.getMapValueWithSettingKey());
    return flattenSetting;
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(TreeMapSettingBlocCreator.getDefaultVizData());
    return flattenSetting;
  }
}
