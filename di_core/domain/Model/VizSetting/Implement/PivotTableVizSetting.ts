/*
 * @author: tvc12 - Thien Vi
 * @created: 5/26/21, 4:21 PM
 */

import {
  ChartFamilyType,
  FieldFormatting,
  FormatterSetting,
  GridSetting,
  StyleSetting,
  TableColumn,
  TooltipSetting,
  TotalSetting,
  VisualHeader,
  VizSettingData,
  VizSettingType
} from '@core/domain/Model';
import { Scrollable } from '@core/domain/Model/Query/Features/Scrollable';
import { VizSetting } from '@core/domain/Model/VizSetting/VizSetting';
import { get } from 'lodash';
import { TablePanelUtils } from '@/utils/TablePanelUtils';
import { ColorConfig } from '@core/domain/Model/VizSetting/ExtraSetting/ColorConfig';
import { HeaderStyleSetting } from '@core/domain/Model/VizSetting/ExtraSetting/TableStyle/HeaderStyleSetting';
import { ValueStyleSetting } from '@core/domain/Model/VizSetting/ExtraSetting/TableStyle/ValueStyleSetting';
import { ToggleIconSetting } from '@core/domain/Model/VizSetting/ExtraSetting/TableStyle/ToggleIconSetting';
import { ConditionalFormatting } from '@core/domain/Model/VizSetting/ExtraSetting/ConditionFormatting/ConditionalFormatting';
import { ConditionalFormattingUtils } from '@core/utils/ConditionalFormattingUtils';

export type Disabled = false | null | undefined;

export interface PivotTableVizData extends VizSettingData {
  enableScrollBar?: boolean;
  valueColors?: ColorConfig[] | Disabled;
  grid?: GridSetting;
  total?: TotalSetting;
  header?: HeaderStyleSetting;
  value?: ValueStyleSetting;
  fieldFormatting?: FieldFormatting;
  conditionalFormatting?: ConditionalFormatting;
  tooltip?: TooltipSetting;
  visualHeader?: VisualHeader;
  style?: StyleSetting;
  toggleIcon?: ToggleIconSetting;
  theme?: string;
}

export class PivotTableVizSetting extends VizSetting<PivotTableVizData> implements Scrollable, FormatterSetting {
  readonly chartFamilyType = ChartFamilyType.Pivot;
  readonly className = VizSettingType.PivotTableSetting;

  constructor(options: PivotTableVizData = {}) {
    super(options);
  }

  static fromObject(obj: any): PivotTableVizSetting {
    return new PivotTableVizSetting(obj.options);
  }

  static isPivotTableSetting(obj: any): obj is PivotTableVizSetting {
    return obj.className === VizSettingType.PivotTableSetting;
  }

  enableScrollBar(): boolean {
    return this.options.enableScrollBar ?? false;
  }

  getColorConfig(valueIndex: number): ColorConfig | undefined {
    const key: string = TablePanelUtils.getGroupKey(valueIndex);
    return get(this.options, key);
  }

  enableFooter(): boolean {
    return this.options.total?.enabled ?? true;
  }

  getFormatters(): TableColumn[] {
    return this.options.conditionalFormatting ? ConditionalFormattingUtils.buildTableColumns(this.options.conditionalFormatting) : [];
  }
}
