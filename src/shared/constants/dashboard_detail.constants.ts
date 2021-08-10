import { NumberWidgetConfig } from '@/shared';
import { QuerySettingType } from '@core/domain/Model/Query/QuerySettingType';

export abstract class DashboardOptions {
  static readonly EDIT_TITLE = 'Edit title';
  static readonly EDIT_TEXT = 'Edit text';
  static readonly CONFIG_FILTER = 'Config filter';
  static readonly CONFIG_CHART = 'Config chart';
  static readonly DUPLICATE_CHART = 'Duplicate chart';
  static readonly DUPLICATE = 'Duplicate';
  static readonly DELETE = 'Delete';
  static readonly ADD_CHART = 'Add chart';
  static readonly ADD_CONTROL = 'Add control';
  static readonly ADD_RULER = 'Add ruler';
  static readonly ADD_TEXT = 'Add text';
  static readonly ADD_LINK = 'Add link';
  static readonly ADD_IMAGE = 'Add image';
  static readonly ZOOM = 'Zoom';
  static readonly DRILLDOWN = 'Drilldown';
}

export abstract class NumberConstants {
  static readonly NUMBER_WIDGET_CONFIGS: NumberWidgetConfig[] = [
    { maxWidth: 96 * 24, minWidth: 96 * 8, numberTextSize: 48, subTitleTextSize: 14, titleTextSize: 24, marginConfig: [8, 24, 12] },
    { maxWidth: 96 * 8, minWidth: 96 * 4, numberTextSize: 36, subTitleTextSize: 14, titleTextSize: 20, marginConfig: [8, 18, 12] },
    { maxWidth: 96 * 4, minWidth: 0, numberTextSize: 24, subTitleTextSize: 11, titleTextSize: 16, marginConfig: [6, 8, 8] }
  ];

  static readonly DEFAULT_NUMBER_TEXT_SIZE = 48;
  static readonly DEFAULT_TITLE_TEXT_SIZE = 20;
  static readonly DEFAULT_SUB_TITLE_TEXT_SIZE = 12;
}

export const DefaultSize = [8, 4];
export const SizeAsMap = new Map([
  [QuerySettingType.Dropdown, [4, 1]],
  [QuerySettingType.TabFilter, [6, 2]],
  [QuerySettingType.Number, [5, 4]],
  [QuerySettingType.Pie, [5, 4]]
]);
