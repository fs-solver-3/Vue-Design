/*
 * @author: tvc12 - Thien Vi
 * @created: 1/20/21, 5:26 PM
 */

import { WidgetRenderer } from '@chart/WidgetRenderer/WidgetRenderer';
import NumberWidget from '@chart/NumberWidget/NumberWidget';

export class CustomNumberRenderer implements WidgetRenderer<NumberWidget> {
  render(widget: NumberWidget, h: any): any {
    return <div key={widget.containerId} id={widget.containerId} class={`${widget.widgetClass} w-100 h-100`} style={widget.numberWidgetStyle}></div>;
  }
}
