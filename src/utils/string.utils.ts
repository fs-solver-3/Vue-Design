import { isString, toNumber, camelCase, kebabCase } from 'lodash';

export abstract class StringUtils {
  private static arrayRegex = /(\w+)\[(\d+)]/;

  static isEmpty(str: string): boolean {
    return !str || !str.length;
  }

  static isNotEmpty(str: string | null): boolean {
    return !!str && !!str.length;
  }

  static camelToCapitalizedStr(str: string) {
    const newStr = str.replace(/[A-Z]/g, ' $&');
    return newStr[0].toUpperCase() + newStr.slice(1);
  }

  // check second text includes in firstText
  static isIncludes(keyword: string, text: string): boolean {
    return text
      .trim()
      .toLocaleLowerCase()
      .includes(keyword.trim().toLocaleLowerCase());
  }

  static removeWhiteSpace(text: string): string {
    return text.replace(/[-\s]*/g, '');
  }

  static formatDisplayNumber(rawData: any, defaultText = '--', locale = 'en-US', options: any = { maximumFractionDigits: 2 }): string {
    const num: number = toNumber(rawData);
    if (isNaN(num)) {
      return rawData ?? defaultText;
    } else {
      return num.toLocaleString(locale, options);
    }
  }

  ///Compare two text
  ///Returns:
  // A negative number if referenceStr occurs before compareString; positive if the referenceStr occurs after compareString; 0 if they are equivalent
  static compare(textA: string, textB: string) {
    if (isString(textA) && isString(textB)) {
      return textA.localeCompare(textB, 'en');
    }
    return 0;
  }

  static toPx(value: any): string {
    const valueAsNumber = toNumber(value);
    if (isNaN(valueAsNumber)) {
      return value;
    } else {
      return valueAsNumber + 'px';
    }
  }

  static toCamelCase(value: string): string {
    return camelCase(value);
  }

  /**
   * find key is array in key
   *
   * ex:
   * animal.0.cat => []
   *
   * animal[0].cat => [animal]
   *
   * animal[0].cat[1].dog => [animal, animal.cat]
   * @param key
   */
  static findPathHasArray(key: string): string[] {
    const paths: string[] = [];
    let parentPath = '';
    key.split('.').forEach(keyName => {
      const currentPath = StringUtils.getCurrentPath(parentPath, keyName);
      if (this.isArrayKey(keyName)) {
        paths.push(currentPath);
      }
      parentPath = currentPath;
    });
    return paths;
  }

  private static isArrayKey(keyName: string) {
    return StringUtils.arrayRegex.test(keyName);
  }

  private static removeArraySyntax(keyName: string): string {
    if (this.isArrayKey(keyName)) {
      const groups: string[] = this.arrayRegex.exec(keyName) ?? [];
      return groups[1] ?? '';
    } else {
      return keyName;
    }
  }

  private static getCurrentPath(parentPath: string, keyName: string): string {
    const normalizeKey = StringUtils.removeArraySyntax(keyName);
    if (parentPath) {
      return StringUtils.buildPath(parentPath, normalizeKey);
    } else {
      return normalizeKey;
    }
  }

  static buildPath(...paths: string[]): string {
    return paths.join('.');
  }

  static toKebabCase(key: string) {
    return kebabCase(key);
  }
}
