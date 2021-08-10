export class PermissionInfo {
  name!: string;
  permission!: string;

  constructor(name: string, permission: string) {
    this.name = name;
    this.permission = permission;
  }
}

export class PermissionGroup {
  groupName!: string;
  allPermission!: PermissionInfo;
  permissions!: PermissionInfo[];

  constructor(groupName: string, allPermission: PermissionInfo, permissions: PermissionInfo[]) {
    this.groupName = groupName;
    this.allPermission = allPermission;
    this.permissions = permissions;
  }

  getAllPermissions() {
    const permissions = this.getPermissions();
    return permissions.concat(this.allPermission.permission);
  }

  getPermissions() {
    return this.permissions?.map(pi => pi.permission) ?? [];
  }

  /**
   *
   * @param selectedPermissions
   */
  getExcludedPermissions(selectedPermissions: string[]): string[] {
    if (selectedPermissions.includes(this.allPermission.permission)) {
      return this.getPermissions();
    } else {
      return [this.allPermission.permission, ...this.getPermissions().filter(permission => !selectedPermissions.includes(permission))];
    }
  }

  getIncludedPermissions(selectedPermissions: string[]): string[] {
    if (selectedPermissions.includes(this.allPermission.permission)) {
      return [this.allPermission.permission];
    } else {
      return this.getPermissions().filter(permission => selectedPermissions.includes(permission));
    }
  }
}

export class SupportPermissionGroups {
  static readonly Permission = new PermissionGroup('Permission', new PermissionInfo('All', 'permission:*:*'), [
    new PermissionInfo('View Permissions', 'permission:view:*'),
    new PermissionInfo('Create Permissions', 'permission:create:*'),
    new PermissionInfo('Edit Permissions', 'permission:edit:*'),
    new PermissionInfo('Delete Permissions', 'permission:delete:*'),
    new PermissionInfo('Assign Permissions', 'permission:assign:*')
  ]);

  static readonly User = new PermissionGroup('User', new PermissionInfo('All', 'user:*:*'), [
    new PermissionInfo('View Users', 'user:view:*'),
    new PermissionInfo('Add New Users', 'user:create:*'),
    new PermissionInfo('Edit Users', 'user:edit:*'),
    new PermissionInfo('Delete Users', 'user:delete:*'),
    new PermissionInfo('Activate Users', 'user:activate:*'),
    new PermissionInfo('Deactivate Users', 'user:deactivate:*')
  ]);

  static readonly Directory = new PermissionGroup('Directory', new PermissionInfo('All', 'directory:*:*'), [
    new PermissionInfo('View Directories', 'directory:view:*'),
    new PermissionInfo('Create Directories', 'directory:create:*'),
    new PermissionInfo('Edit Directories', 'directory:edit:*'),
    new PermissionInfo('Delete Directories', 'directory:delete:*'),
    new PermissionInfo('Copy Directories', 'directory:copy:*')
  ]);

  static readonly Dashboard = new PermissionGroup('Dashboard', new PermissionInfo('All', 'dashboard:*:*'), [
    new PermissionInfo('View Dashboards', 'dashboard:view:*'),
    new PermissionInfo('Create Dashboards', 'dashboard:create:*'),
    new PermissionInfo('Edit Dashboards', 'dashboard:edit:*'),
    new PermissionInfo('Delete Dashboards', 'dashboard:delete:*'),
    new PermissionInfo('Copy Dashboards', 'dashboard:copy:*')
  ]);
  static readonly Widget = new PermissionGroup('Widget', new PermissionInfo('All', 'widget:*:*'), [
    new PermissionInfo('View Widgets', 'widget:view:*'),
    new PermissionInfo('Create Widgets', 'widget:create:*'),
    new PermissionInfo('Edit Widgets', 'widget:edit:*'),
    new PermissionInfo('Delete Widgets', 'widget:delete:*')
  ]);
  static readonly Database = new PermissionGroup('Data Management', new PermissionInfo('All', 'database:*:*'), [
    new PermissionInfo('View Databases', 'database:view:*'),
    new PermissionInfo('Create Databases', 'database:create:*'),
    new PermissionInfo('Edit Databases', 'database:edit:*'),
    new PermissionInfo('Delete Databases', 'database:delete:*')
  ]);
  static readonly Setting = new PermissionGroup('Setting', new PermissionInfo('All', 'setting:*:*'), [new PermissionInfo('Edit Settings', 'setting:edit:*')]);
}
