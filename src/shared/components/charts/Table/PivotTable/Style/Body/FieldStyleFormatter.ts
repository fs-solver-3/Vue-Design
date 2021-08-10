/*
 * @author: tvc12 - Thien Vi
 * @created: 6/28/21, 5:04 PM
 */

import { BodyStyleFormatter } from '@chart/Table/PivotTable/Style/Body/BodyStyleFormatter';
import { AbstractTableResponse, FieldFormatter, PivotTableQuerySetting, PivotTableVizSetting } from '@core/domain';
import { CustomStyleData } from '@chart/CustomTable/TableData';
import { PivotFieldFormatterUtils } from '@chart/Table/PivotTable/Style/PivotFieldFormatterUtils';
import { ObjectUtils } from '@core/utils';
import { BodyData } from '@chart/Table/PivotTable/Style/Body/BodyData';
import { TableStyleUtils } from '@chart/Table/TableStyleUtils';

export class FieldStyleFormatter implements BodyStyleFormatter<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting> {
  createStyle(bodyData: BodyData<PivotTableQuerySetting, AbstractTableResponse, PivotTableVizSetting>): CustomStyleData {
    const { baseThemeColor, querySetting, bodyCellData, vizSetting } = bodyData;
    const fieldFormatter: FieldFormatter | undefined = PivotFieldFormatterUtils.getFieldFormatter(bodyCellData.header, querySetting, vizSetting);
    if (fieldFormatter && fieldFormatter.applyValues) {
      const widgetColor = vizSetting.getBackgroundColor();
      const style = {
        color: fieldFormatter.style?.color,
        'text-align': fieldFormatter.align,
        'background-color': TableStyleUtils.combineColor(baseThemeColor, fieldFormatter.backgroundColor, widgetColor)
      };
      return { css: ObjectUtils.removeKeyIfValueNotExist(style) };
    } else {
      return { css: {} } as any;
    }
  }
}
