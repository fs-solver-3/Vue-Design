/*
 * @author: tvc12 - Thien Vi
 * @created: 5/26/21, 6:37 PM
 */

import ColorScale from 'color-scales';
import Color from 'color';
import { Log } from '@core/utils/Log';

export class ColorUtils {
  /**
   * get color from min and max
   * @param ratio: from [0, 1]
   * @param minColor: min color
   * @param maxColor: max color
   */
  static getColorFromMinMax(ratio: number, minColor: string, maxColor: string): string {
    const colorScale: ColorScale = new ColorScale(0, 1000, [new Color(minColor).hex(), new Color(maxColor).hex()], 1);
    const percentage: number = Math.floor(ratio * 1000);
    return colorScale.getColor(percentage).toHexString();
  }

  static combine(baseHexColor: string, hexColors: string[]): string {
    let base = new Color(baseHexColor);
    hexColors.forEach(hexColor => {
      const color: Color = new Color(hexColor);
      base = this.combineColor(base, color);
    });
    return base.hex();
  }

  private static combineColor(colorA: Color, colorB: Color): Color {
    return colorA.mix(colorB, 0.4005);
  }

  static hasAlpha(baseHexColor: string): boolean {
    const color = new Color(baseHexColor);
    return color.alpha() < 1;
  }

  static mix(hexColorA: string, hexColorB: string): string {
    const colorA = new Color(hexColorA);
    const colorB = new Color(hexColorB);
    return colorA.mix(colorB).hex();
  }
}
