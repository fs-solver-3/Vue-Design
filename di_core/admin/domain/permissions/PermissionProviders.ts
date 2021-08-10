import { DirectoryPermissionProviderImpl } from '@core/admin/domain/permissions/DirectoryProvider';
import { PermsPermissionProviderImpl } from '@core/admin/domain/permissions/PermProvider';
import { UserPermissionProviderImpl } from '@core/admin/domain/permissions/UserProvider';
import { WidgetPermissionProviderImpl } from '@core/admin/domain/permissions/WidgetProvider';
import { DashboardPermissionProviderImpl } from '@core/admin/domain/permissions/DashboardProvider';
import { SettingPermissionProviderImpl } from './SettingProvider';
import { ActionType, ResourceType } from '@/utils/permission_utils';
import { ActionNode } from '@/shared';
import { Log } from '@core/utils';
import { DatabasePermissionProviderImpl } from '@core/admin/domain/permissions/DatabaseProvider';

export class PermissionProviders {
  static permission() {
    return new PermsPermissionProviderImpl();
  }

  static user() {
    return new UserPermissionProviderImpl();
  }

  static directory() {
    return new DirectoryPermissionProviderImpl();
  }

  static dashboard() {
    return new DashboardPermissionProviderImpl();
  }

  static widget() {
    return new WidgetPermissionProviderImpl();
  }

  static setting() {
    return new SettingPermissionProviderImpl();
  }

  static database() {
    return new DatabasePermissionProviderImpl();
  }

  static buildPermissionsFromActions(resourceType: string, resourceId: number, actions: string[]): string[] {
    return actions.map(action => this.buildPermission(resourceType, action, resourceId));
  }

  static buildPermission(resourceType: string, action: string, resourceId: number): string {
    return `${resourceType}:${action}:${resourceId}`;
  }

  static isPermitted(resourceType: ResourceType, resourceId: number, actions: string[], permissions: string[]): boolean {
    const perms = PermissionProviders.buildPermissionsFromActions(resourceType, resourceId, actions);
    Log.debug('permissions::', permissions);
    Log.debug('perms from actions::', perms);
    let result = true;
    perms.forEach(perm => {
      if (!permissions.includes(perm)) {
        Log.debug('false permitted', perm);
        result = false;
      }
    });
    Log.debug('IsPermitted::', permissions, actions);
    return result;
  }

  static getHighestPermissionType(resourceType: ResourceType, resourceId: number, permissions: string[], actionNode: ActionNode[]): ActionType {
    for (let iterator = 0; iterator < actionNode.length; iterator++) {
      if (this.isPermitted(resourceType, resourceId, actionNode[iterator].actions, permissions)) {
        Log.debug('getHighestPermission::', actionNode[iterator].type);
        return actionNode[iterator].type;
      }
    }
    return ActionType.none;
  }
}
