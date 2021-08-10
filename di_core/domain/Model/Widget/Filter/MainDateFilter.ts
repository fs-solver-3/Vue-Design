import { Field, MainDateFilterMode } from '@core/domain/Model';

/**
 * @deprecated will remove
 */
export class MainDateFilter {
  affectedField: Field;
  mode?: MainDateFilterMode;

  constructor(affectedField: Field, mode?: MainDateFilterMode) {
    this.affectedField = affectedField;
    this.mode = mode;
  }

  static fromObject(obj: MainDateFilter): MainDateFilter {
    return new MainDateFilter(obj.affectedField, obj.mode);
  }
}
