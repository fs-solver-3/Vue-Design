/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:48 PM
 */

import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { ChartFamilyType, SeriesVizData, VizSettingData, VizSettingType } from '@core/domain/Model';

export class WordCloudVizSetting extends VizSetting<SeriesVizData> {
  static readonly DEFAULT_SETTING = {};
  readonly chartFamilyType = ChartFamilyType.WordCloud;
  readonly className = VizSettingType.WordCloudSetting;

  constructor(options: VizSettingData = {}) {
    super(options);
  }

  static fromObject(obj: WordCloudVizSetting): WordCloudVizSetting {
    return new WordCloudVizSetting(obj.options);
  }
}
