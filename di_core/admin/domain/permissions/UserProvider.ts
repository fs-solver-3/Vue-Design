import { CommonPermissionProvider } from '@core/admin/domain/permissions/CommonPermissionProvider';
import { PermissionProvider } from '@core/admin/domain/permissions/PermissionProvider';

export abstract class BaseUserPermissionProvider extends PermissionProvider implements CommonPermissionProvider {
  protected id: string | undefined;

  withUserId(id: string) {
    this.id = id;
    return this;
  }

  abstract all(): string;

  abstract view(): string;

  abstract create(): string;

  abstract edit(): string;

  abstract delete(): string;

  abstract activate(): string;

  abstract deactivate(): string;
}

export class UserPermissionProviderImpl extends BaseUserPermissionProvider {
  all(): string {
    return this.buildPerm('user', '*', this.id ?? '*');
  }

  view(): string {
    return this.buildPerm('user', 'view', this.id ?? '*');
  }

  create(): string {
    return this.buildPerm('user', 'create', this.id ?? '*');
  }

  edit(): string {
    return this.buildPerm('user', 'edit', this.id ?? '*');
  }

  delete(): string {
    return this.buildPerm('user', 'delete', this.id ?? '*');
  }

  activate(): string {
    return this.buildPerm('user', 'activate', this.id ?? '*');
  }

  deactivate(): string {
    return this.buildPerm('user', 'deactivate', this.id ?? '*');
  }
}
