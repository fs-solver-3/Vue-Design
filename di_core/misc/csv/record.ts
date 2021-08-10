export const isObject = (value: any) => Object.prototype.toString.call(value) === '[object Object]';

export interface ObjectRecord<T> {
  [k: string]: T;
}

export type Field = any;

export type ObjectHeaderItem = { id: string; title: string };

export type ObjectStringifierHeader = ObjectHeaderItem[] | string[];
