/*
 * @author: tvc12 - Thien Vi
 * @created: 5/16/21, 3:37 PM
 */

import { IndexedHeaderData, RowData } from '@/shared/models';
import { SortDirection } from '@core/domain/Request';
import { HeaderController } from '@chart/CustomTable/Header/HeaderController';
import { Log } from '@core/utils';
import { CustomCellCallBack } from '@chart/CustomTable/TableData';

export class HeaderControllerBuilder {
  private hasPinned = false;
  private numPinnedSize = 1;
  private headers: IndexedHeaderData[] = [];
  private mainHeaders: IndexedHeaderData[] = [];
  private rows: RowData[] = [];
  private sortAsMap: Map<string, SortDirection> = new Map<string, SortDirection>();
  private onClickSort?: (label: string) => void;
  private cellWidth = 0;
  private cellHeight = 0;
  private customCellCallBack?: CustomCellCallBack;
  withPinnedData(hasPinned: boolean, numPinnedSize: number): HeaderControllerBuilder {
    this.hasPinned = hasPinned;
    this.numPinnedSize = numPinnedSize;
    return this;
  }

  withHeaderData(headers: IndexedHeaderData[], mainHeaders: IndexedHeaderData[]): HeaderControllerBuilder {
    this.headers = headers;
    this.mainHeaders = mainHeaders;
    return this;
  }

  withRowData(rows: RowData[]): HeaderControllerBuilder {
    this.rows = rows;
    return this;
  }

  withSortData(sortAsMap: Map<string, SortDirection>, onClickSort?: (label: string) => void): HeaderControllerBuilder {
    this.sortAsMap = sortAsMap;
    this.onClickSort = onClickSort;
    return this;
  }

  withCustomRender(customCellCallBack?: CustomCellCallBack): HeaderControllerBuilder {
    this.customCellCallBack = customCellCallBack;
    return this;
  }

  withCellInfo(cellWidth: number, cellHeight: number): HeaderControllerBuilder {
    this.cellHeight = cellHeight;
    this.cellWidth = cellWidth;
    return this;
  }

  build(): HeaderController {
    return new HeaderController(
      this.hasPinned,
      this.numPinnedSize,
      this.headers,
      this.mainHeaders,
      this.rows,
      this.cellWidth,
      this.cellHeight,
      this.sortAsMap,
      this.onClickSort,
      this.customCellCallBack
    );
  }
}
