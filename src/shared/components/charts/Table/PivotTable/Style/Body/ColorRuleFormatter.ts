/*
 * @author: tvc12 - Thien Vi
 * @created: 7/14/21, 3:36 PM
 */

import { BodyStyleFormatter } from '@chart/Table/PivotTable/Style/Body/BodyStyleFormatter';
import { AbstractTableResponse, ApplyToType, ConditionalFormattingType, PivotTableQuerySetting, PivotTableVizSetting } from '@core/domain';
import { CustomStyleData } from '@chart/CustomTable/TableData';
import { BodyData } from '@chart/Table/PivotTable/Style/Body/BodyData';
import { ListUtils } from '@/utils';
import { ConditionalFormattingUtils, FormatHeaderType } from '@core/utils/ConditionalFormattingUtils';
import { Log } from '@core/utils';
import { RuleFormatterUtils } from '@chart/Table/DefaultTable/Style/Body/RuleHandler/RuleFormatterUtils';
import { PivotFieldFormatterUtils } from '@chart/Table/PivotTable/Style/PivotFieldFormatterUtils';
import { PivotFormatAs } from '@chart/Table/PivotTable/Style/PivotFormatAs';
import { ColorRuleFormatter as TableColorRuleFormatter } from '@chart/Table/DefaultTable/Style/Body/ColorRuleFormatter';

export class ColorRuleFormatter implements BodyStyleFormatter<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting> {
  createStyle(bodyData: BodyData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>): CustomStyleData {
    try {
      if (this.canUseColorRule(bodyData)) {
        const formatType = PivotFieldFormatterUtils.getFormatType(bodyData.querySetting);
        switch (formatType) {
          case PivotFormatAs.Table:
            return TableColorRuleFormatter.createColorStyle(bodyData);
          case PivotFormatAs.OneRow:
            return this.createNormalColorStyle(bodyData);
          default:
            return this.createDefaultBackground(bodyData);
        }
      } else {
        return PivotFieldFormatterUtils.getDefaultStyle();
      }
    } catch (ex) {
      Log.error('ColorRuleFormatter::error', ex);
      return PivotFieldFormatterUtils.getDefaultStyle();
    }
  }

  private createDefaultBackground(bodyData: BodyData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>) {
    const isFirstColumn = bodyData.bodyCellData.columnIndex == 0;
    if (isFirstColumn) {
      return PivotFieldFormatterUtils.getDefaultStyle();
    } else {
      return this.createNormalColorStyle(bodyData);
    }
  }

  createNormalColorStyle(bodyData: BodyData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>): CustomStyleData {
    const { bodyCellData, vizSetting, tableResponse } = bodyData;
    const { conditionalFormatting } = vizSetting.options;
    const formattingData = ConditionalFormattingUtils.findConditionFormattingData(conditionalFormatting!, bodyCellData.header)!;
    const headerFormatting = ConditionalFormattingUtils.findPivotHeaderFormatter(formattingData, bodyCellData.header, FormatHeaderType.Color);

    if (headerFormatting) {
      const minMaxData = ConditionalFormattingUtils.findMinMaxData(tableResponse, headerFormatting);
      return {
        css: {
          color: RuleFormatterUtils.getColor(formattingData.color!, headerFormatting, minMaxData, bodyCellData.rowData)
        } as any
      };
    } else {
      return PivotFieldFormatterUtils.getDefaultStyle();
    }
  }

  private canUseColorRule(bodyData: BodyData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>) {
    const { querySetting, bodyCellData, vizSetting } = bodyData;
    const { conditionalFormatting } = vizSetting.options;
    const isFormatterExisted = ListUtils.isNotEmpty(querySetting.formatters);
    const color = ConditionalFormattingUtils.findConditionFormattingData(conditionalFormatting, bodyCellData.header)?.color;
    const canApplyBody = color?.applyTo === ApplyToType.ValuesOnly || color?.applyTo === ApplyToType.ValueAndTotals;
    return isFormatterExisted && canApplyBody && color && color.formatType === ConditionalFormattingType.Rules;
  }
}
