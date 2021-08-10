import { CreationBlocFromBlocData, CreationBlocFromQueryData, SettingBlocCreator } from '@/screens/ChartBuilder/SettingBloc';
import { ChartSettingUtils2, MapUtils } from '@/utils';
import { SeriesVizData, VizSettingData } from '@core/domain';
import { ObjectUtils } from '@core/utils';
import { cloneDeep } from 'lodash';
import { WordCloudSettingBloc } from '@/shared/Settings/WordCloudSetting/WordCloudSettingBloc';
import { WidgetType } from '@/shared';

export class WordCloudSettingBlocCreator implements SettingBlocCreator<WordCloudSettingBloc> {
  private static readonly chartTypeKey = 'chart.type';
  createBlocFromBloc(data: CreationBlocFromBlocData): WordCloudSettingBloc {
    const flattenDefaultSetting: Map<string, any> = this.getDefaultSetting(data);
    const flattenOldSetting = SettingBlocCreator.getOldSetting(data);

    const flattenSetting: Map<string, any> = MapUtils.merge(flattenDefaultSetting, flattenOldSetting);
    const currentVizSettingData: VizSettingData = ChartSettingUtils2.convertToObject(flattenSetting);
    return new WordCloudSettingBloc(flattenSetting, currentVizSettingData);
  }

  createBlocFromQuery(data: CreationBlocFromQueryData): WordCloudSettingBloc {
    const vizSettingData = data.query.getVisualizationSetting()?.options ?? {};
    const settingAsMap: Map<string, any> = ObjectUtils.flatKey(vizSettingData);
    return new WordCloudSettingBloc(settingAsMap, vizSettingData);
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
      background: '#0000001A'
    };
  }

  private getOldSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = cloneDeep(data.oldBloc.getMapValueWithSettingKey());
    flattenSetting.delete(WordCloudSettingBlocCreator.chartTypeKey);
    return flattenSetting;
  }

  private getDefaultSetting(data: CreationBlocFromBlocData): Map<string, any> {
    const flattenSetting = ObjectUtils.flatKey(WordCloudSettingBlocCreator.getDefaultVizData());
    flattenSetting.set(WordCloudSettingBlocCreator.chartTypeKey, WidgetType.wordCloud);
    return flattenSetting;
  }
}
