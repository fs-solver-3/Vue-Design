/*
 * @author: tvc12 - Thien Vi
 * @created: 1/19/21, 5:49 PM
 */

import { WidgetRenderer } from '@chart/WidgetRenderer/WidgetRenderer';
import NumberWidget from '@chart/NumberWidget/NumberWidget';
import TableHeader from '@chart/Table/TableHeader.vue';

export class DefaultNumberRenderer implements WidgetRenderer<NumberWidget> {
  render(widget: NumberWidget, h: any): any {
    return (
      <div id={`chart-${widget.id}`} key={`chart-${widget.id}`} class={`${widget.widgetClass} w-100 h-100`} style={widget.numberWidgetStyle}>
        <TableHeader {...{ props: widget.headerProps }} />
        <div id={`value-${widget.id}`} class="number-widget-number text-nowrap w-100" style={widget.valueBarStyle} oncontextmenu={widget.handleShowContextMenu}>
          <span style={widget.prefixStyle}>{widget.prefix}</span>
          <span style={widget.valueStyle}>{widget.formattedValue}</span>
          <span style={widget.postfixStyle}>{widget.postfix} </span>
        </div>

        <b-tooltip popover-style={{ background: '#ffffff' }} {...{ props: widget.tooltipConfig }} target={`value-${widget.id}`} custom-class="number-tooltip">
          <div style={widget.tooltipStyle}>{widget.displayValue}</div>
        </b-tooltip>
        {this.renderCompareValue(widget, h)}
      </div>
    );
  }

  private renderCompareValue(widget: NumberWidget, h: any) {
    if (widget.compareValue) {
      return (
        <div style={widget.compareStyle} class="number-widget-compare d-flex align-items-center text-nowrap">
          <div class="number-widget-compare-content">
            {this.renderIconCompare(widget, h)}
            {widget.compareValueFormat}
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  }

  private renderIconCompare(widget: NumberWidget, h: any): any {
    if (widget.isCompareDown) {
      return <b-icon-arrow-down />;
    } else {
      return <b-icon-arrow-up />;
    }
  }
}
