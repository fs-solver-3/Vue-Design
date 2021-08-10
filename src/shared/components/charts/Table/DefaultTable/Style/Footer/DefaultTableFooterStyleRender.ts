/*
 * @author: tvc12 - Thien Vi
 * @created: 6/23/21, 5:36 PM
 */

import { AbstractTableQuerySetting, AbstractTableResponse, TableVizSetting } from '@core/domain';
import { CustomFooterCellData, CustomStyleData } from '@chart/CustomTable/TableData';
import { ObjectUtils } from '@core/utils';
import { TableFooterStyleRender } from '@chart/Table/StyleRender/TableFooterStyleRender';
import { FooterStyleFormatter } from '@chart/Table/DefaultTable/Style/Footer/FooterStyleFormatter';
import { FooterData } from '@chart/Table/DefaultTable/Style/Footer/FooterData';
import { TableFieldStyleFormatter } from '@chart/Table/DefaultTable/Style/Footer/TableFieldStyleFormatter';

export class DefaultTableFooterStyleRender implements TableFooterStyleRender {
  private tableResponse: AbstractTableResponse;
  private querySetting: AbstractTableQuerySetting;
  private vizSetting: TableVizSetting;
  private styleFormatters: FooterStyleFormatter<AbstractTableQuerySetting, AbstractTableResponse, TableVizSetting>[];
  private baseThemeColor: string;

  constructor(tableResponse: AbstractTableResponse, query: AbstractTableQuerySetting, baseThemeColor: string) {
    this.tableResponse = tableResponse;
    this.querySetting = query;
    this.vizSetting = query.getVisualizationSetting()!;
    this.baseThemeColor = baseThemeColor;
    this.styleFormatters = DefaultTableFooterStyleRender.getStyleFormatters();
  }

  private static getStyleFormatters() {
    return [new TableFieldStyleFormatter()];
  }

  createStyle(cellData: CustomFooterCellData): CustomStyleData {
    const bodyData: FooterData<AbstractTableQuerySetting, AbstractTableResponse, TableVizSetting> = {
      tableResponse: this.tableResponse,
      querySetting: this.querySetting,
      data: cellData,
      baseThemeColor: this.baseThemeColor,
      vizSetting: this.vizSetting
    };
    const styles: CustomStyleData[] = this.styleFormatters.map(formatter => formatter.createStyle(bodyData));

    return ObjectUtils.mergeStyles(styles);
  }
}
