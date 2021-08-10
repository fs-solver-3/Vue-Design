import { CommonPermissionProvider } from '@core/admin/domain/permissions/CommonPermissionProvider';
import { PermissionProvider } from '@core/admin/domain/permissions/PermissionProvider';

export abstract class BaseSettingPermissionProvider extends PermissionProvider implements CommonPermissionProvider {
  protected id: number | undefined;

  withDirectoryId(id: number) {
    this.id = id;
    return this;
  }

  abstract all(): string;

  abstract view(): string;

  abstract create(): string;

  abstract edit(): string;

  abstract delete(): string;
}

export class SettingPermissionProviderImpl extends BaseSettingPermissionProvider {
  all(): string {
    return this.buildPerm('setting', '*', this.id?.toString() ?? '*');
  }

  view(): string {
    return this.buildPerm('setting', 'view', this.id?.toString() ?? '*');
  }

  create(): string {
    return this.buildPerm('setting', 'create', this.id?.toString() ?? '*');
  }

  edit(): string {
    return this.buildPerm('setting', 'edit', this.id?.toString() ?? '*');
  }

  delete(): string {
    return this.buildPerm('setting', 'delete', this.id?.toString() ?? '*');
  }
}
