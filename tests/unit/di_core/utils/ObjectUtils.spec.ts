/*
 * @author: tvc12 - Thien Vi
 * @created: 7/15/21, 2:58 PM
 */

import { expect } from 'chai';
import { Log, ObjectUtils } from '@core/utils';
import { get } from 'lodash';
import { StringUtils } from '@/utils/string.utils';
import { ChartSettingUtils2 } from '@/utils';

describe('Convert string to object', () => {
  it('should convert normal string to object', () => {
    const key = 'animal.cat.dog.data';
    const value = 'hello';
    const obj = ObjectUtils.toObject(key, value);
    expect(obj.animal.cat.dog.data).eq(value);
    expect(get(obj, key)).eq(value);
  });
  it('should convert string contain number to object', () => {
    const key = 'animal.cat.dog.2020.data';
    const value = 'hello';
    const obj = ObjectUtils.toObject(key, value);
    expect(obj.animal.cat.dog[`2020`].data).eq(value);
    expect(get(obj, key)).eq(value);
  });
  it('should convert string contain array to object', () => {
    const key = 'animal.cat.dog[0].data';
    const value = 'hello';
    const obj = ObjectUtils.toObject(key, value);
    expect(obj.animal.cat.dog[0].data).eq(value);
    expect(get(obj, key)).eq(value);
  });
});

describe('Find path has array syntax', () => {
  it('should get normal syntax', () => {
    const key = 'animal.cat.dog.data';
    const listPath = StringUtils.findPathHasArray(key);
    expect(listPath.length).eq(0);
  });
  it('should get key has 1 array', () => {
    const key = 'animal.cat.dog[0].data';
    const listPath = StringUtils.findPathHasArray(key);
    expect(listPath.length).eq(1);
    expect(listPath[0]).eq('animal.cat.dog');
  });
  it('should get key has 2 array', () => {
    const key = 'animal[0].cat.dog[0].data';
    const listPath = StringUtils.findPathHasArray(key);
    expect(listPath.length).eq(2);
    expect(listPath[0]).eq('animal');
    expect(listPath[1]).eq('animal.cat.dog');
  });
  it('should get key is empty', () => {
    const key = '';
    const listPath = StringUtils.findPathHasArray(key);
    expect(listPath.length).eq(0);
  });
});

describe('Convert map to object', () => {
  it('should convert normal syntax', () => {
    const map = new Map([
      ['animal.dog.cat', 1],
      ['animal.dog.meo', 2],
      ['animal.meo', 3]
    ]);
    const obj = ChartSettingUtils2.convertToObject(map);
    expect(get(obj, 'animal.dog.cat')).eq(1);
    expect(get(obj, 'animal.dog.meo')).eq(2);
    expect(get(obj, 'animal.meo')).eq(3);
  });
  it('should convert array syntax', () => {
    const map = new Map([
      ['animal[0].dog.cat', 1],
      ['animal[0].dog.meo', 2],
      ['animal[1].meo', 3]
    ]);
    const obj = ChartSettingUtils2.convertToObject(map);
    expect(get(obj, 'animal[0].dog.cat')).eq(1);
    expect(get(obj, 'animal[0].dog.meo')).eq(2);
    expect(get(obj, 'animal[1].meo')).eq(3);
    expect(Array.isArray(obj.animal)).eq(true);
  });

  it('should convert array syntax', () => {
    const map = new Map([
      ['animal.dog[0].cat', 1],
      ['animal.dog[1].meo', 2],
      ['animal.meo.cat[0]', 3]
    ]);
    const obj = ChartSettingUtils2.convertToObject(map);
    expect(get(obj, 'animal.dog[0].cat')).eq(1);
    expect(get(obj, 'animal.dog[1].meo')).eq(2);
    expect(Array.isArray(get(obj, 'animal.dog'))).eq(true);
    expect(get(obj, 'animal.meo.cat[0]')).eq(3);
    expect(Array.isArray(get(obj, 'animal.meo.cat'))).eq(true);
  });
});
