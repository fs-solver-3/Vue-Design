import { CommonPermissionProvider } from '@core/admin/domain/permissions/CommonPermissionProvider';
import { PermissionProvider } from '@core/admin/domain/permissions/PermissionProvider';

export abstract class BasePermsPermissionProvider extends PermissionProvider implements CommonPermissionProvider {
  protected id: string | undefined;

  withPermission(id: string) {
    this.id = id;
    return this;
  }

  abstract all(): string;

  abstract view(): string;

  abstract create(): string;

  abstract edit(): string;

  abstract delete(): string;

  abstract assign(): string;
}

export class PermsPermissionProviderImpl extends BasePermsPermissionProvider {
  all(): string {
    return this.buildPerm('permission', '*', this.id ?? '*');
  }

  view(): string {
    return this.buildPerm('permission', 'view', this.id ?? '*');
  }

  create(): string {
    return this.buildPerm('permission', 'create', this.id ?? '*');
  }

  edit(): string {
    return this.buildPerm('permission', 'edit', this.id ?? '*');
  }

  delete(): string {
    return this.buildPerm('permission', 'delete', this.id ?? '*');
  }

  assign(): string {
    return this.buildPerm('permission', 'assign', this.id ?? '*');
  }
}
