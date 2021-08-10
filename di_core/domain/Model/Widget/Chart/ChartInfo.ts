/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:56 PM
 */

import { WidgetExtraData, WidgetCommonData, WidgetId, Widgets, VizSetting, VizSettingData } from '@core/domain/Model';
import { QueryRelatedWidget } from './QueryRelatedWidget';
import { SettingItem } from '@/shared/models';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';

export class ChartInfo implements QueryRelatedWidget {
  readonly className = Widgets.Chart;
  setting: QuerySetting;

  id: WidgetId;
  name: string;
  description: string;
  backgroundColor?: string;
  extraData?: WidgetExtraData;
  textColor?: string;

  constructor(commonSetting: WidgetCommonData, setting: QuerySetting) {
    this.id = commonSetting.id;
    this.name = commonSetting.name;
    this.description = commonSetting.description;
    this.backgroundColor = commonSetting.backgroundColor;
    this.extraData = commonSetting.extraData;
    this.textColor = commonSetting.textColor;
    this.setting = setting;
  }

  static fromObject(data: ChartInfo): ChartInfo {
    const querySetting = QuerySetting.fromObject(data.setting) as QuerySetting;
    return new ChartInfo(data, querySetting);
  }

  setTitle(title: string): void {
    this.name = title;
    this.updateTitleInSetting(title);
    this.updateTitleInExtraData(title);
  }

  static isChartInfo(obj: any): obj is ChartInfo {
    return obj.className === Widgets.Chart;
  }

  private updateTitleInSetting(title: string): void {
    const vizSetting: VizSetting<VizSettingData> | undefined = this.setting.getVisualizationSetting();
    if (vizSetting) {
      vizSetting.setTitle(title);
    }
  }

  private updateTitleInExtraData(title: string): void {
    const settingItem: SettingItem | undefined = this.extraData?.tabItems[0]?.settingItems?.find(item => item.key == 'title');
    if (settingItem) {
      settingItem.value = title;
    }
  }
}
