import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { GaugeVizData, VizSettingData } from '@core/domain';
import { ObjectUtils } from '@core/utils';
import { GaugeSettingBloc } from '@/shared/Settings/GaugeSetting/GaugeSettingBloc';

export class GaugeSettingBlocCreator implements SettingBlocCreator<GaugeSettingBloc> {
  createBlocFromBloc(data: CreationBlocFromBlocData): GaugeSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new GaugeSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): GaugeSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new GaugeSettingBloc(settingAsMap, vizSettingData);
  }

  private getDefaultVizData(): GaugeVizData {
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
      background: '#0000001A',
      plotOptions: {
        solidgauge: {
          dataLabels: {
            enabled: true,
            style: {
              color: '#FFFFFF',
              fontSize: '24px',
              fontFamily: 'Barlow',
              textOutline: 0
            }
          }
        },
        gauge: {
          dial: {
            backgroundColor: '#2187FF'
          }
        }
      },
      yAxis: {
        min: 0,
        max: 10000
      },
      target: 0
    };
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(this.getDefaultVizData());
    ///Set new widget type to default setting
    flattenSetting.set(SettingBlocCreator.chartTypeKey, 'solidgauge');
    return flattenSetting;
  }
}
