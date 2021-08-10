import { SortDirection } from '@core/domain/Request';
import { Log } from '@core/utils';
import { isObject } from 'lodash';
import { toNumber } from 'lodash';

export class DiTableHeader {
  public key: string;
  public label: string;
  public isGroupBy?: boolean;
  public isTextLeft?: boolean;
  public thClass: string;
  public tdClass: string;

  // public sortable: boolean;

  constructor(data: any = {}) {
    this.key = data.key || void 0;
    this.label = data.label || void 0;
    this.isGroupBy = data.isGroupBy;
    this.isTextLeft = data.isTextLeft;
    this.thClass = data.thClass || '';
    this.tdClass = data.tdClass || '';
    // this.sortable = data.sortable ?? false;
  }
}

export class Pagination {
  public sortBy: string;
  public descending: boolean;
  public page: number;
  public rowsPerPage: number;
  public rowsNumber: number;
  /// key is Field name, value is SortDirection (example: {"Region", "DEC"})
  public sortAsMap: Map<string, SortDirection>;

  constructor(data: any = {}) {
    this.sortBy = data.sortBy || void 0;
    this.descending = data.descending || void 0;
    this.page = data.page || 1;
    this.rowsPerPage = data.rowsPerPage || 30;
    this.rowsNumber = data.rowsNumber || void 0;
    this.sortAsMap = data.sortAsMap ?? new Map();
  }

  get from(): number {
    return (this.page - 1) * this.rowsPerPage;
  }

  get size(): number {
    return this.rowsPerPage;
  }

  updateSort(label: string) {
    const newDirection = this.getNewSortDirection(label);
    // FIXME: sortAsMap must sync with HeaderController in CustomTable.vue
    this.sortAsMap.clear();
    this.sortAsMap.set(label, newDirection);
    Log.debug('sort map in pagination: ', this.sortAsMap);
  }

  private getNewSortDirection(label: string) {
    const currentSortDirection = this.sortAsMap.get(label) ?? SortDirection.Desc;
    switch (currentSortDirection) {
      case SortDirection.Desc:
        return SortDirection.Asc;
      case SortDirection.Asc:
        return SortDirection.Desc;
    }
  }
}

// Data from table
export interface HeaderData {
  key: string;
  label: string;
  total?: number;
  isTextLeft?: boolean;
  isGroupBy?: boolean;
  children?: HeaderData[];
  width?: number;
  disableSort?: boolean;
  drilldownLevel?: number;
  formatterKey?: string;
  formatters?: HeaderData[];
}

export interface IndexedData {
  rowSpan: number;
  colSpan: number;
  rowIndex: number;
  columnIndex: number;
}

export class IndexedHeaderData implements HeaderData, IndexedData {
  isGroupBy?: boolean;
  isTextLeft?: boolean;
  key: string;
  label: string;
  rowSpan: number;
  colSpan: number;
  rowIndex: number;
  columnIndex: number;
  total?: number;
  children: IndexedHeaderData[];
  width?: number;
  drilldownLevel: number;
  disableSort?: boolean;
  formatterKey?: string;
  parent?: IndexedHeaderData;
  formatters?: HeaderData[];

  constructor(headerData: HeaderData, indexedData: IndexedData, children?: IndexedHeaderData[], parent?: IndexedHeaderData) {
    this.colSpan = indexedData.colSpan;
    this.rowSpan = indexedData.rowSpan;
    this.rowIndex = indexedData.rowIndex;
    this.columnIndex = indexedData.columnIndex;

    this.isTextLeft = headerData.isTextLeft;
    this.isGroupBy = headerData.isGroupBy;
    this.key = headerData.key;
    this.label = headerData.label;
    this.children = children ?? [];
    this.total = headerData.total;
    this.width = headerData.width;
    this.drilldownLevel = headerData.drilldownLevel ?? 0;
    this.disableSort = headerData.disableSort;
    this.formatterKey = headerData.formatterKey;
    this.parent = parent;
    this.formatters = headerData.formatters;
  }

  getRowIndexEnd(): number {
    return this.rowIndex + this.rowSpan;
  }

  getColumnIndexEnd(): number {
    return this.columnIndex + this.colSpan;
  }

  copyWith(obj: {
    isGroupBy?: boolean;
    isTextLeft?: boolean;
    key?: string;
    label?: string;
    rowSpan?: number;
    colSpan?: number;
    rowStart?: number;
    colStart?: number;
    value?: number;
    children?: IndexedHeaderData[];
    width?: number;
    drilldownLevel?: number;
    disableSort?: boolean;
    formatterKey?: string;
    parent?: IndexedHeaderData;
    formatters?: HeaderData[];
  }): IndexedHeaderData {
    return new IndexedHeaderData(
      {
        key: obj.key ?? this.key,
        label: obj.label ?? this.label,
        isTextLeft: obj.isTextLeft ?? this.isTextLeft,
        isGroupBy: obj.isGroupBy ?? this.isGroupBy,
        total: obj.value ?? this.total,
        width: obj.width ?? this.width,
        disableSort: obj.disableSort ?? this.disableSort,
        drilldownLevel: obj.drilldownLevel ?? this.drilldownLevel,
        formatterKey: obj.formatterKey ?? this.formatterKey,
        formatters: obj.formatters ?? this.formatters
      },
      {
        rowSpan: obj.rowSpan ?? this.rowSpan,
        colSpan: obj.colSpan ?? this.colSpan,
        rowIndex: obj.rowStart ?? this.rowIndex,
        columnIndex: obj.colStart ?? this.columnIndex
      },
      obj.children ?? this.children,
      obj.parent ?? this.parent
    );
  }
}

export type CellRender = (rowData: RowData, rowIndex: number, header: IndexedHeaderData, columnIndex: number) => HTMLElement;

export class CustomCell {
  customRender: CellRender;

  constructor(customRender: CellRender) {
    this.customRender = customRender;
  }

  static isCustomCell(obj: any): obj is CustomCell {
    return isObject(obj) && Object.prototype.hasOwnProperty.call(obj, 'customRender');
  }
}

export interface RowData {
  isExpanded: boolean;
  children: RowData[];
  depth: number;
  parent?: RowData;

  [key: string]: any | CustomCell;
}

export class ViewPort {
  public fromColumnIndex: number;
  public columnSize: number;

  public rowIndexStart: number;
  public rowSize: number;

  constructor(columnStart: number, columnSize: number, rowStart: number, rowSize: number) {
    this.fromColumnIndex = columnStart;
    this.columnSize = columnSize;
    this.rowIndexStart = rowStart;
    this.rowSize = rowSize;
  }

  get rowIndexEnd() {
    return this.rowIndexStart + this.rowSize;
  }

  get toColumnIndex() {
    return this.fromColumnIndex + this.columnSize;
  }

  static default(): ViewPort {
    return new ViewPort(0, 0, 0, 0);
  }
}

export class RowDataUtils {
  static getData(rowData: RowData, header: HeaderData): any | undefined {
    return rowData[header.key];
  }
  static getDataAsNumber(rowData: RowData, header: HeaderData): number {
    return toNumber(this.getData(rowData, header));
  }
}
