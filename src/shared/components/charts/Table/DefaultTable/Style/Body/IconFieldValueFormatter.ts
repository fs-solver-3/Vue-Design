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
import { HtmlElementRenderUtils } from '@/utils/HtmlElementRenderUtils';

export class IconFieldValueFormatter implements BodyStyleFormatter<AbstractTableQuerySetting, AbstractTableResponse, TableVizSetting> {
  static createIconStyle(
    bodyData:
      | BodyData<AbstractTableQuerySetting<TableVizSetting>, AbstractTableResponse, TableVizSetting>
      | BodyData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>
  ): CustomStyleData {
    const { bodyCellData, vizSetting, tableResponse } = bodyData;
    const { conditionalFormatting } = vizSetting.options;
    const formattingData = ConditionalFormattingUtils.findConditionFormattingData(conditionalFormatting!, bodyCellData.header)!;
    const headerFormatting = ConditionalFormattingUtils.findTableHeaderForFormatting(formattingData, tableResponse, FormatHeaderType.Icon);
    if (headerFormatting) {
      const imgSrc = bodyCellData.rowData[headerFormatting.key];
      const img = HtmlElementRenderUtils.renderImgAsString(imgSrc);
      return {
        css: {} as any,
        icon: {
          iconHTML: HtmlElementRenderUtils.renderDivAsString(img, 'icon'),
          align: formattingData.icon?.align ?? 'top',
          layout: formattingData.icon?.layout ?? 'left'
        }
      };
    } else {
      return TableFieldFormatterUtils.getDefaultStyle();
    }
  }

  createStyle(bodyData: BodyData<AbstractTableQuerySetting, AbstractTableResponse, TableVizSetting>): CustomStyleData {
    try {
      if (this.canUseIconRule(bodyData)) {
        return IconFieldValueFormatter.createIconStyle(bodyData);
      } else {
        return TableFieldFormatterUtils.getDefaultStyle();
      }
    } catch (ex) {
      Log.error('IconFieldValueFormatter::error', ex);
      return TableFieldFormatterUtils.getDefaultStyle();
    }
  }

  private canUseIconRule(bodyData: BodyData<AbstractTableQuerySetting, AbstractTableResponse, TableVizSetting>) {
    const { querySetting, bodyCellData, vizSetting } = bodyData;
    const { conditionalFormatting } = vizSetting.options;
    const isFormatterExisted = ListUtils.isNotEmpty(querySetting.formatters);
    const iconFormatting = ConditionalFormattingUtils.findConditionFormattingData(conditionalFormatting, bodyCellData.header)?.icon;
    const canApplyBody = iconFormatting?.applyTo === ApplyToType.ValuesOnly || iconFormatting?.applyTo === ApplyToType.ValueAndTotals;
    return isFormatterExisted && canApplyBody && iconFormatting && iconFormatting.formatType === ConditionalFormattingType.FieldValue;
  }
}
