/*
 * @author: tvc12 - Thien Vi
 * @created: 6/23/21, 5:36 PM
 */

import { AbstractTableQuerySetting, AbstractTableResponse, FieldFormatter, TableVizSetting } from '@core/domain';
import { CustomHeaderCellData, CustomStyleData } from '@chart/CustomTable/TableData';
import { ObjectUtils } from '@core/utils';
import { TableHeaderStyleRender } from '@chart/Table/StyleRender/TableHeaderStyleRender';
import { TableFieldFormatterUtils } from '@chart/Table/DefaultTable/Style/TableFieldFormatterUtils';

export class DefaultTableHeaderStyleRender implements TableHeaderStyleRender {
  private tableResponse: AbstractTableResponse;
  private querySetting: AbstractTableQuerySetting;
  private vizSetting: TableVizSetting;

  constructor(tableResponse: AbstractTableResponse, query: AbstractTableQuerySetting) {
    this.tableResponse = tableResponse;
    this.querySetting = query;
    this.vizSetting = query.getVisualizationSetting()!;
  }

  createStyle(cellData: CustomHeaderCellData): CustomStyleData {
    return {
      css: {
        ...this.getFieldCustomStyle(cellData, this.querySetting, this.vizSetting)
      }
    };
  }

  private getFieldCustomStyle(cellData: CustomHeaderCellData, querySetting: AbstractTableQuerySetting, vizSetting: TableVizSetting): any {
    const fieldFormatter: FieldFormatter | undefined = TableFieldFormatterUtils.getFieldFormatter(cellData.header, querySetting, vizSetting);
    if (fieldFormatter && fieldFormatter.applyHeader) {
      const style = {
        color: fieldFormatter.style?.color,
        'text-align': fieldFormatter.align,
        'background-color': fieldFormatter.backgroundColor
      };
      return ObjectUtils.removeKeyIfValueNotExist(style);
    } else {
      return {};
    }
  }
}
