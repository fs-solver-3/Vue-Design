/*
 * @author: tvc12 - Thien Vi
 * @created: 5/8/21, 12:09 PM
 */

export class DomUtils {
  static bind(key: string, data: any): void {
    // @ts-ignored
    window[`${key}`] = data;
  }
}
