/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 11:01 PM
 */

export abstract class PageResult<T> {
  protected constructor(public data: T[], public total: number) {}
}
