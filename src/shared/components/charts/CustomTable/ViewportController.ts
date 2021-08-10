/*
 * @author: tvc12 - Thien Vi
 * @created: 5/11/21, 11:08 AM
 */

import { Log } from '@core/utils';
import { ViewPort } from '@/shared/models';

export class ViewportController {
  private lastRepaintY = 0;
  private lastRepaintX = 0;

  private rowHeight: number;
  private headerSize: number;
  private columnWidth: number;

  private rowsSize = 0;
  private cachedItemsSize = 0;

  private columnsSize = 0;
  private cachedColumnsSize = 0;
  private viewPort: ViewPort = ViewPort.default();

  private maxBufferY = 0;
  private maxBufferX = 0;

  constructor(rowHeight: number, columnWidth: number, headerSize: number) {
    this.rowHeight = rowHeight;
    this.headerSize = headerSize;
    this.columnWidth = columnWidth;
  }

  static default() {
    return new ViewportController(0, 0, 0);
  }

  getViewport() {
    return this.viewPort;
  }

  init(screenWidth: number, screenHeight: number) {
    this.initRowRenderingInfo(screenHeight);
    this.initColumnRenderingInfo(screenWidth);
    this.initBuffer();

    this.viewPort = new ViewPort(0, this.cachedColumnsSize, 0, this.cachedItemsSize);

    Log.debug('init::', 'columnWidth::', this.columnWidth, 'rowHeight::', this.rowHeight);
    Log.debug('rowsSize::', this.rowsSize, 'cachedItemsSize', this.cachedItemsSize);
    Log.debug('ColumnSize::', this.columnsSize, 'cachedColumnsSize', this.cachedColumnsSize);
    Log.debug('------------------------------');
  }

  canRepaint(top: number, left: number): boolean {
    const currentLeft = left;

    const canRepaintVertical: boolean = !this.lastRepaintY || Math.abs(top - this.lastRepaintY) > this.maxBufferY || top < this.lastRepaintY;
    const canRepaintHorizontal: boolean = !this.lastRepaintX || Math.abs(currentLeft - this.lastRepaintX) > this.maxBufferX || currentLeft < this.lastRepaintX;

    return canRepaintVertical || canRepaintHorizontal;
  }

  move(top: number, left: number): void {
    const currentLeft = left;
    const rowStart = Math.floor(Math.max(0, top / this.rowHeight));
    const columnStart = Math.floor(Math.max(0, currentLeft / this.columnWidth));
    this.viewPort = new ViewPort(columnStart, this.cachedColumnsSize, rowStart, this.cachedItemsSize);
    this.lastRepaintY = top;
    this.lastRepaintX = currentLeft;
  }

  private initBuffer() {
    // MaxBuffer by px
    this.maxBufferY = this.rowsSize * this.rowHeight;
    this.maxBufferX = this.columnsSize * this.columnWidth;
  }

  private initRowRenderingInfo(screenHeight: number) {
    // Cache 3 or 4 times the number of items that fit in the container viewport
    this.rowsSize = Math.ceil(screenHeight / this.rowHeight) + 5;
    this.cachedItemsSize = Math.floor(this.rowsSize * 1.5);
  }

  private initColumnRenderingInfo(screenWidth: number) {
    this.columnsSize = Math.ceil(screenWidth / this.columnWidth) + 5;
    this.cachedColumnsSize = Math.floor(this.columnsSize * 2);
  }
}
