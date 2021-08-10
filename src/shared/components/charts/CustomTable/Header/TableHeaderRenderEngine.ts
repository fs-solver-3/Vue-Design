/*
 * @author: tvc12 - Thien Vi
 * @created: 5/16/21, 3:46 PM
 */

import { TableDataUtils } from '@chart/CustomTable/TableDataUtils';
import { SortDirection } from '@core/domain/Request';
import { isNumber } from 'lodash';
import { CustomStyleData } from '@chart/CustomTable/TableData';
import { TableTooltipUtils } from '@chart/CustomTable/TableTooltipUtils';

export interface HeaderCellData {
  rowSpan: number;
  colSpan: number;
  colIndex: number;
  top: number;
  left?: number;
  width?: number;
  classList: string[];
  onClick: () => void;
  data: string;
  hasSort: boolean;
  sortDirection: SortDirection;
  customStyle?: CustomStyleData;
}

export class TableHeaderRenderEngine {
  static renderHeaders(listHeaderCells: HeaderCellData[][]): HTMLElement {
    const header: HTMLElement = document.createElement('thead');
    const elements = listHeaderCells.map(TableHeaderRenderEngine.renderMultiCellHeader);
    header.append(...elements);
    return header;
  }

  private static renderMultiCellHeader(headers: HeaderCellData[]): HTMLElement {
    const elements: HTMLElement[] = headers.map(TableHeaderRenderEngine.renderSingleCellHeader);
    const rowElement = document.createElement('tr');
    rowElement.append(...elements);
    return rowElement;
  }

  private static renderSingleCellHeader(headerCellData: HeaderCellData): HTMLElement {
    const cellElement: HTMLTableHeaderCellElement = document.createElement('th');
    TableHeaderRenderEngine.bindConfigToCell(cellElement, headerCellData);
    TableHeaderRenderEngine.bindDataToCell(cellElement, headerCellData);
    TableHeaderRenderEngine.addSortElementIfExist(cellElement, headerCellData);
    TableHeaderRenderEngine.bindTooltipToCell(cellElement, headerCellData);
    return cellElement;
  }

  private static bindConfigToCell(cellElement: HTMLTableHeaderCellElement, headerCellData: HeaderCellData): void {
    cellElement.rowSpan = headerCellData.rowSpan;
    cellElement.colSpan = headerCellData.colSpan;

    cellElement.setAttribute('col-index', headerCellData.colIndex.toString());
    cellElement.classList.add(...headerCellData.classList);

    cellElement.style.top = TableDataUtils.toPx(headerCellData.top);

    if (isNumber(headerCellData.left)) {
      cellElement.style.left = TableDataUtils.toPx(headerCellData.left);
    }

    if (isNumber(headerCellData.width)) {
      cellElement.style.width = cellElement.style.maxWidth = cellElement.style.minWidth = TableDataUtils.toPx(headerCellData.width);
    }

    if (headerCellData.onClick) {
      cellElement.onclick = headerCellData.onClick;
    }
    TableDataUtils.setStyle(cellElement, headerCellData.customStyle);
  }

  private static renderSortElement(sortDirection: SortDirection): HTMLElement {
    const iconSort = document.createElement('i');
    switch (sortDirection) {
      case SortDirection.Asc:
        iconSort.classList.add('fas', 'fa-caret-down', 'ml-2');
        break;
      case SortDirection.Desc:
        iconSort.classList.add('fas', 'fa-caret-up', 'ml-2');
        break;
    }
    return iconSort;
  }

  private static bindDataToCell(cell: HTMLElement, cellData: HeaderCellData): void {
    cell.append(cellData.data);
  }

  private static addSortElementIfExist(cell: HTMLElement, cellData: HeaderCellData): void {
    if (cellData.hasSort) {
      const sortElement = TableHeaderRenderEngine.renderSortElement(cellData.sortDirection);
      cell.append(sortElement);
    }
  }

  private static bindTooltipToCell(cellElement: HTMLTableDataCellElement, cellData: HeaderCellData) {
    if (cellData.data) {
      cellElement.setAttribute('data-title', cellData.data);
      TableTooltipUtils.configTooltip(cellElement);
    }
  }
}
