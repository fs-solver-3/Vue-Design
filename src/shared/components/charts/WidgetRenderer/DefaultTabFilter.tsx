/*
 * @author: tvc12 - Thien Vi
 * @created: 1/20/21, 5:26 PM
 */

import { WidgetRenderer } from '@chart/WidgetRenderer/WidgetRenderer';
import TabFilter from '@chart/TabFilter';
import TabSelection from '@/shared/components/TabSelection.vue';
import { StringUtils } from '@/utils/string.utils';

export class DefaultTabFilter implements WidgetRenderer<TabFilter> {
  render(widget: TabFilter, h: any): any {
    const enableTitle = widget.setting.options.title?.enabled ?? true;
    const enableSubTitle = widget.setting.options.subtitle?.enabled ?? true;
    return (
      <div class={widget.containerClass} style={widget.containerStyle}>
        <div class={widget.infoClass}>
          {enableTitle && (
            <div class="filter-chart single-line" title={widget.title} style={widget.titleStyle}>
              {widget.title}
            </div>
          )}
          {enableSubTitle && this.renderSubtitle(widget, h)}
        </div>
        <TabSelection
          {...{ props: widget.tabSelectionData }}
          class={widget.filterClass}
          onSelected={widget.handleFilterChanged}
          style={widget.selectionStyle}
        />
      </div>
    );
  }

  private renderSubtitle(widget: TabFilter, h: any) {
    if (!!widget.subTitle && StringUtils.isNotEmpty(widget.subTitle)) {
      return <img class={'mx-1'} src={require('@/assets/icon/ic_help.svg')} alt="subtitle" title={widget.subTitle} />;
    }
    return <div></div>;
  }
}
