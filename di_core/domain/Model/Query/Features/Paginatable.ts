/*
 * @author: tvc12 - Thien Vi
 * @created: 5/21/21, 12:11 PM
 */

export abstract class Paginatable {
  static isPaginatable(obj: any): obj is Paginatable {
    return !!obj.getFrom && !!obj.getSize;
  }

  abstract getFrom(): number;

  abstract getSize(): number;
}
