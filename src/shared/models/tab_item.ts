/*
 * @author: tvc12 - Thien Vi
 * @created: 12/9/20, 2:27 PM
 */

/*
 * @author: tvc12 - Thien Vi
 * @created: 12/9/20, 2:27 PM
 */

import { SettingItem } from '@/shared/models/setting_item';
import { SelectOption, SettingItemType } from '@/shared';
import { ListUtils } from '@/utils';

/**
 * @deprecated from v1.0.4
 */
export class TabItem {
  key: string;
  name: string;
  settingItems: SettingItem[];

  constructor(key: string, name: string, settingItems: SettingItem[]) {
    this.key = key;
    this.name = name;
    this.settingItems = settingItems;
  }

  get hasItem(): boolean {
    return ListUtils.isNotEmpty(this.settingItems);
  }

  static fromObject(obj: TabItem): TabItem {
    const settingItems = obj.settingItems?.map(item => SettingItem.fromObject(item)) ?? [];
    return new TabItem(obj.key, obj.name, settingItems);
  }

  removeItem(key: string) {
    const index = this.settingItems.findIndex(item => item.key === key);
    if (index !== -1) {
      this.settingItems.splice(index, 1);
    }
  }

  getItem(key: string): SettingItem | undefined {
    return this.findSetting(this.settingItems ?? [], key);
  }

  updateItem(key: string, newValue: any, options?: SelectOption[]) {
    const item = this.settingItems.find(settingItem => settingItem.key == key);
    if (item) {
      item.updateItem(key, newValue, options);
    } else {
      const groupItems: SettingItem[] = this.settingItems.filter(item => item.type == SettingItemType.group);
      groupItems.forEach(group => {
        group.innerSettingItems?.forEach(innerItem => {
          innerItem.updateItem(key, newValue, options);
        });
      });
    }
  }

  addItems(items: SettingItem[]) {
    this.settingItems.push(...items);
  }

  removeDynamicKey(startWith: string) {
    const keysToRemove: string[] = this.settingItems.map(item => item.key).filter(value => value.startsWith(startWith));
    keysToRemove.forEach(key => {
      this.removeItem(key);
    });
  }

  getSettingDynamicKey(startWith: string) {
    return this.settingItems.filter(value => value.key.startsWith(startWith));
  }

  private findSetting(settingItems: SettingItem[], key: string): SettingItem | undefined {
    for (let i = 0; i < settingItems.length; ++i) {
      const settingItem = settingItems[i];
      if (settingItem.type == SettingItemType.group) {
        if (settingItem.key == key) {
          return settingItem;
        } else {
          return this.findSetting(settingItem.innerSettingItems ?? [], key);
        }
      } else {
        if (settingItem.key == key) {
          return settingItem;
        }
      }
    }
  }
}
