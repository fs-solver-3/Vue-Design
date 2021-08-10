/*
 * @author: tvc12 - Thien Vi
 * @created: 6/28/21, 5:04 PM
 */

import {
  AbstractTableResponse,
  ApplyToType,
  ConditionalFormattingType,
  ConditionalFormattingData,
  PivotTableQuerySetting,
  PivotTableVizSetting,
  TableResponse
} from '@core/domain';
import { CustomStyleData } from '@chart/CustomTable/TableData';
import { ListUtils } from '@/utils';
import { ConditionalFormattingUtils, FormatHeaderType } from '@core/utils/ConditionalFormattingUtils';
import { Log } from '@core/utils';
import { ColorScaleUtils } from '@chart/Table/DefaultTable/Style/Body/ColorScaleUtils';
import { FooterStyleFormatter } from '@chart/Table/DefaultTable/Style/Footer/FooterStyleFormatter';
import { FooterData } from '@chart/Table/DefaultTable/Style/Footer/FooterData';
import { PivotFieldFormatterUtils } from '@chart/Table/PivotTable/Style/PivotFieldFormatterUtils';
import { PivotFormatAs } from '@chart/Table/PivotTable/Style/PivotFormatAs';
import { HeaderData } from '@/shared/models';

export class ColorScaleFormatter implements FooterStyleFormatter<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting> {
  createStyle(bodyData: FooterData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>): CustomStyleData {
    try {
      if (this.canUseColorScale(bodyData)) {
        const formatType = PivotFieldFormatterUtils.getFormatType(bodyData.querySetting);
        switch (formatType) {
          case PivotFormatAs.Table:
            return this.createTableColorStyle(bodyData);
          default: {
            return this.createColorStyle(bodyData);
          }
        }
      } else {
        return PivotFieldFormatterUtils.getDefaultStyle();
      }
    } catch (ex) {
      Log.error('ColorScaleFormatter::error', ex);
      return PivotFieldFormatterUtils.getDefaultStyle();
    }
  }

  createColorStyle(bodyData: FooterData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>): CustomStyleData {
    const { data, vizSetting, tableResponse } = bodyData;
    const { conditionalFormatting } = vizSetting.options;
    const formattingData = ConditionalFormattingUtils.findConditionFormattingData(conditionalFormatting!, data.header)!;
    const headerFormatting = ConditionalFormattingUtils.findPivotHeaderFormatter(formattingData, data.header, FormatHeaderType.Color);
    return this.buildStyle(formattingData, headerFormatting, tableResponse);
  }

  private canUseColorScale(bodyData: FooterData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>) {
    const { querySetting, data, vizSetting } = bodyData;
    // ignore formatting first column
    const isNotFirstColumn = data.header.columnIndex > 0;
    const { conditionalFormatting } = vizSetting.options;
    const isFormatterExisted = ListUtils.isNotEmpty(querySetting.formatters);
    const color = ConditionalFormattingUtils.findConditionFormattingData(conditionalFormatting, data.header)?.color;
    const canApplyBody = color?.applyTo === ApplyToType.TotalsOnly || color?.applyTo === ApplyToType.ValueAndTotals;
    return isNotFirstColumn && isFormatterExisted && canApplyBody && color && color.formatType === ConditionalFormattingType.ColorScale;
  }

  private createTableColorStyle(bodyData: FooterData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>) {
    const { data, vizSetting, tableResponse } = bodyData;
    const { conditionalFormatting } = vizSetting.options;
    const formattingData = ConditionalFormattingUtils.findConditionFormattingData(conditionalFormatting!, data.header)!;
    const headerFormatting = ConditionalFormattingUtils.findTableHeaderForFormatting(formattingData, tableResponse, FormatHeaderType.Color);

    return this.buildStyle(formattingData, headerFormatting, tableResponse);
  }

  private buildStyle(formattingData: ConditionalFormattingData, headerFormatting: HeaderData | undefined, tableResponse: TableResponse) {
    if (headerFormatting) {
      const minMaxData = ConditionalFormattingUtils.findMinMaxData(tableResponse, headerFormatting);
      return {
        css: {
          color: ColorScaleUtils.getFooterColor(headerFormatting, formattingData.color!, minMaxData)
        } as any
      };
    } else {
      return PivotFieldFormatterUtils.getDefaultStyle();
    }
  }
}
