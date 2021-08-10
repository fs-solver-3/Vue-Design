import { RandomUtils } from '@/utils/random.utils';
import { snakeCase } from 'lodash';

enum PrefixId {
  Button = 'btn',
  Input = 'input',
  Dropdown = 'swm-select',
  Filter = 'dynamic',
  Widget = 'widget',
  Checkbox = 'input-checkbox',
  MultiSelection = 'multi-selection'
}

export class IdGenerator {
  static generateButtonId(name: string, index?: number) {
    return index ? `${PrefixId.Button}-${name}-${index}` : `${PrefixId.Button}-${name}`;
  }

  static generateInputId(name: string, index?: number) {
    return index ? `${PrefixId.Input}-${name}-${index}` : `${PrefixId.Input}-${name}`;
  }

  static generateDropdownId(name: string, index?: number) {
    return index ? `${PrefixId.Dropdown}-${name}-${index}` : `${PrefixId.Dropdown}-${name}`;
  }

  static generateMultiSelectionId(name: string, index?: number) {
    return index ? `${PrefixId.MultiSelection}-${name}-${index}` : `${PrefixId.MultiSelection}-${name}`;
  }

  static generateFilterId(...metaData: (string | number)[]): string {
    const suffix: string = metaData.join('-');
    return `${PrefixId.Filter}-${suffix}`;
  }

  static generateName(fieldName: string): string {
    const name = snakeCase(fieldName);
    return `${name}_${RandomUtils.nextInt(1, 500000)}`;
  }

  static generateKey(keys: string[], separator = '.'): string {
    return keys.join(separator);
  }
}

export const GenIdMethods = {
  genBtnId: IdGenerator.generateButtonId,
  genInputId: IdGenerator.generateInputId,
  genDropdownId: IdGenerator.generateDropdownId,
  genMultiSelectionId: IdGenerator.generateMultiSelectionId,
  genFilterId: IdGenerator.generateFilterId
};
