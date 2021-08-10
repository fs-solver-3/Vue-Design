import { expect } from 'chai';
import { StringUtils } from '@/utils/string.utils';

describe('Normalize Name', () => {
  it('should normalize to with -', () => {
    const key = 'chua_join_domain';
    const result = StringUtils.toCamelCase(key);
    expect(result).eq('chuaJoinDomain');
  });

  it('should normalize to with space and dot', () => {
    const key = 'chua Join.domain';
    const result = StringUtils.toCamelCase(key);
    expect(result).eq('chuaJoinDomain');
  });

  it('should normalize to with tieng viet', () => {
    const key = 'Bản Quyền';
    const result = StringUtils.toCamelCase(key);
    expect(result).eq('bảnQuyền');
    expect(key).eq('Bản Quyền');
  });
});
