/*
 * @author: tvc12 - Thien Vi
 * @created: 6/28/21, 5:04 PM
 */

import { BodyStyleFormatter } from '@chart/Table/PivotTable/Style/Body/BodyStyleFormatter';
import {
  AbstractTableQuerySetting,
  AbstractTableResponse,
  ApplyToType,
  ConditionalFormattingType,
  PivotTableQuerySetting,
  PivotTableVizSetting,
  TableVizSetting
} from '@core/domain';
import { CustomStyleData } from '@chart/CustomTable/TableData';
import { BodyData } from '@chart/Table/PivotTable/Style/Body/BodyData';
import { ListUtils } from '@/utils';
import { ConditionalFormattingUtils, FormatHeaderType } from '@core/utils/ConditionalFormattingUtils';
import { Log } from '@core/utils';
import { TableFieldFormatterUtils } from '@chart/Table/DefaultTable/Style/TableFieldFormatterUtils';

export class BackgroundFieldValueFormatter implements BodyStyleFormatter<AbstractTableQuerySetting, AbstractTableResponse, TableVizSetting> {
  static createBackgroundColorStyle(
    bodyData:
      | BodyData<AbstractTableQuerySetting<TableVizSetting>, AbstractTableResponse, TableVizSetting>
      | BodyData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>
  ): CustomStyleData {
    const { bodyCellData, vizSetting, tableResponse } = bodyData;
    const { conditionalFormatting } = vizSetting.options;
    const formattingData = ConditionalFormattingUtils.findConditionFormattingData(conditionalFormatting!, bodyCellData.header)!;
    const headerFormatting = ConditionalFormattingUtils.findTableHeaderForFormatting(formattingData, tableResponse, FormatHeaderType.BackgroundColor);
    if (headerFormatting) {
      const color = bodyCellData.rowData[headerFormatting.key];
      return {
        css: {
          'background-color': color
        } as any
      };
    } else {
      return TableFieldFormatterUtils.getDefaultStyle();
    }
  }

  createStyle(bodyData: BodyData<AbstractTableQuerySetting, AbstractTableResponse, TableVizSetting>): CustomStyleData {
    try {
      if (this.canUseFieldValue(bodyData)) {
        return BackgroundFieldValueFormatter.createBackgroundColorStyle(bodyData);
      } else {
        return TableFieldFormatterUtils.getDefaultStyle();
      }
    } catch (ex) {
      Log.error('FieldValueBackgroundColorFormatter::error', ex);
      return TableFieldFormatterUtils.getDefaultStyle();
    }
  }

  private canUseFieldValue(bodyData: BodyData<AbstractTableQuerySetting, AbstractTableResponse, TableVizSetting>) {
    const { querySetting, bodyCellData, vizSetting } = bodyData;
    const { conditionalFormatting } = vizSetting.options;
    const isFormatterExisted = ListUtils.isNotEmpty(querySetting.formatters);
    const backgroundColor = ConditionalFormattingUtils.findConditionFormattingData(conditionalFormatting, bodyCellData.header)?.backgroundColor;
    const canApplyBody = backgroundColor?.applyTo === ApplyToType.ValuesOnly || backgroundColor?.applyTo === ApplyToType.ValueAndTotals;
    return isFormatterExisted && canApplyBody && backgroundColor && backgroundColor.formatType === ConditionalFormattingType.FieldValue;
  }
}
