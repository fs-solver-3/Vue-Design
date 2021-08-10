export enum ActionType {
  none = 'none',
  view = 'view',
  edit = 'edit',
  create = 'create',
  delete = 'delete',
  copy = 'copy',
  all = '*'
}

export const editActions = [ActionType.view, ActionType.edit, ActionType.copy, ActionType.delete, ActionType.create];

export enum ResourceType {
  dashboard = 'dashboard',
  directory = 'directory',
  widget = 'widget'
}

export class PermissionUtils {
  static isPermissionViewDashboard(permissionType: ActionType): boolean {
    return permissionType == ActionType.view;
  }

  static isPermissionEditDashboard(permissionType: ActionType): boolean {
    return permissionType == ActionType.edit || permissionType == ActionType.all;
  }

  static isPermissionEditChart(permissionType: ActionType): boolean {
    return permissionType == ActionType.edit || permissionType == ActionType.all;
  }

  static isPermissionDeleteChart(permissionType: ActionType): boolean {
    return permissionType == ActionType.all;
  }

  static isPermissionCreateChart(permissionType: ActionType): boolean {
    return permissionType == ActionType.all;
  }

  static isPermissionDuplicateChart(permissionType: ActionType): boolean {
    return permissionType == ActionType.all;
  }
}
