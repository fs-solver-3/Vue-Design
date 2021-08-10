import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { ParliamentSettingData, VizSettingData } from '@core/domain';
import { ObjectUtils } from '@core/utils';
import { cloneDeep } from 'lodash';
import { ParliamentSettingBloc } from '@/shared/Settings/ParliamentSetting/ParliamentSettingBloc';

export class ParliamentSettingBlocCreator implements SettingBlocCreator<ParliamentSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): ParliamentSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new ParliamentSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): ParliamentSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new ParliamentSettingBloc(settingAsMap, vizSettingData);
  }

  private static getDefaultVizData(): ParliamentSettingData {
    return {
      legend: {
        enabled: true,
        verticalAlign: 'bottom',
        layout: 'horizontal',
        title: {
          text: ''
        }
      },
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
        item: {
          borderWidth: 0,
          borderColor: 'black',
          dataLabels: {
            enabled: false,
            borderWidth: 0,
            textOutline: '0px contrast',
            useHTML: true,
            style: {
              border: '0px transparent',
              borderColor: 'none',
              textShadow: false,
              outline: 'none'
            }
          }
        }
      },
      numDataPoint: 1000
    };
  }

  private getOldSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = cloneDeep(data.oldBloc.getMapValueWithSettingKey());
    flattenSetting.delete(SettingBlocCreator.chartTypeKey);
    return flattenSetting;
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(ParliamentSettingBlocCreator.getDefaultVizData());
    flattenSetting.set(SettingBlocCreator.chartTypeKey, 'item');
    return flattenSetting;
  }
}
