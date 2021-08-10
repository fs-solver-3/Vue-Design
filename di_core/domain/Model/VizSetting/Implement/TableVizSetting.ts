/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:42 PM
 */

import { ChartFamilyType, FieldFormatting, GridSetting, TableColumn, TooltipSetting, VisualHeader, VizSettingData, VizSettingType } from '@core/domain/Model';
import { Scrollable } from '@core/domain/Model/Query/Features/Scrollable';
import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { get } from 'lodash';
import { TablePanelUtils } from '@/utils/TablePanelUtils';
import { ColorConfig } from '@core/domain/Model/VizSetting/ExtraSetting/ColorConfig';
import { HeaderStyleSetting } from '@core/domain/Model/VizSetting/ExtraSetting/TableStyle/HeaderStyleSetting';
import { ValueStyleSetting } from '@core/domain/Model/VizSetting/ExtraSetting/TableStyle/ValueStyleSetting';
import { ToggleIconSetting } from '@core/domain/Model/VizSetting/ExtraSetting/TableStyle/ToggleIconSetting';
import { ConditionalFormatting } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/ConditionalFormatting';
import { FormatterSetting } from './FormatterSetting';
import { ConditionalFormattingUtils } from '@core/utils/ConditionalFormattingUtils';
export enum DisplayTableType {
  Collapse = 'collapse',
  Normal = 'Normal'
}

export interface TableVizData extends VizSettingData {
  displayType?: DisplayTableType;
  enableScrollBar?: boolean;
  header?: HeaderStyleSetting;
  value?: ValueStyleSetting;
  grid?: GridSetting;
  fieldFormatting?: FieldFormatting;
  conditionalFormatting?: ConditionalFormatting;
  tooltip?: TooltipSetting;
  visualHeader?: VisualHeader;
  toggleIcon?: ToggleIconSetting;
  theme?: string;
}

export class TableVizSetting extends VizSetting<TableVizData> implements Scrollable, FormatterSetting {
  chartFamilyType = ChartFamilyType.Table;
  className = VizSettingType.TableSetting;

  constructor(options: TableVizData = {}) {
    super(options);
  }

  static fromObject(obj: any): TableVizSetting {
    return new TableVizSetting(obj.options);
  }

  static isTableSetting(setting: any): setting is TableVizSetting {
    return setting.className === VizSettingType.TableSetting;
  }

  getDisplayTableType(): DisplayTableType {
    return this.options.displayType ?? DisplayTableType.Collapse;
  }

  enableScrollBar(): boolean {
    return this.options.enableScrollBar ?? false;
  }

  getColorData(valueIndex: number): ColorConfig | undefined {
    const key: string = TablePanelUtils.getGroupKey(valueIndex);
    return get(this.options, key);
  }

  getFormatters(): TableColumn[] {
    return this.options.conditionalFormatting ? ConditionalFormattingUtils.buildTableColumns(this.options.conditionalFormatting) : [];
  }
}
