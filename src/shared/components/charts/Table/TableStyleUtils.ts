/*
 * @author: tvc12 - Thien Vi
 * @created: 6/24/21, 2:48 PM
 */

import { GridSetting, HorizontalGridSetting, PivotTableVizData, TableVizData, VerticalGridSetting } from '@core/domain';
import { StringUtils } from '@/utils/string.utils';
import { ThemeModule } from '@/store/modules/theme.store';
import { ColorUtils } from '@/utils/ColorUtils';
enum CombineMode {
  All,
  CombineWithWidgetColor,
  None
}
export class TableStyleUtils {
  static getGridStyle(grid?: GridSetting) {
    const vertical = grid?.vertical ?? {};
    const borderVerticalStyle = this.getBorderStyle(vertical);
    const horizontal = grid?.horizontal ?? {};
    const borderHorizontalStyle = this.getBorderStyle(horizontal);
    return {
      '--grid-header-vertical-style': vertical.applyHeader ? borderVerticalStyle : void 0,
      '--grid-body-vertical-style': vertical.applyBody ? borderVerticalStyle : void 0,
      '--grid-footer-vertical-style': vertical.applyTotal ? borderVerticalStyle : void 0,
      '--grid-header-horizontal-style': horizontal.applyHeader ? borderHorizontalStyle : void 0,
      '--grid-body-horizontal-style': horizontal.applyBody ? borderHorizontalStyle : void 0,
      '--grid-footer-horizontal-style': horizontal.applyTotal ? borderHorizontalStyle : void 0
    };
  }

  static getBorderStyle(borderSetting?: VerticalGridSetting | HorizontalGridSetting) {
    if (borderSetting) {
      const width: string = StringUtils.toPx(borderSetting.thickness) ?? '1px';
      const color: string = borderSetting.color ?? '#FFFFFF19';
      return `${width} solid ${color}`;
    } else {
      return 'none';
    }
  }

  static combineColor(baseThemeColor: string, backgroundColor?: string, widgetColor?: string): string | undefined {
    if (backgroundColor) {
      const widgetBackgroundColor = widgetColor ?? '#00000019';
      const combineMode = this.getCombineMode(backgroundColor, widgetBackgroundColor);
      switch (combineMode) {
        case CombineMode.All:
          return ColorUtils.combine(baseThemeColor, [widgetBackgroundColor, backgroundColor]);
        case CombineMode.CombineWithWidgetColor:
          return ColorUtils.combine(widgetBackgroundColor, [backgroundColor]);
        case CombineMode.None:
          return backgroundColor;
      }
    }
  }

  private static getCombineMode(background: string, widgetColor: string): CombineMode {
    if (ColorUtils.hasAlpha(background)) {
      return ColorUtils.hasAlpha(widgetColor) ? CombineMode.All : CombineMode.CombineWithWidgetColor;
    } else {
      return CombineMode.None;
    }
  }
}
