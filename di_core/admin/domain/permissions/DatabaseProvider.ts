import { CommonPermissionProvider } from '@core/admin/domain/permissions/CommonPermissionProvider';
import { PermissionProvider } from '@core/admin/domain/permissions/PermissionProvider';

export abstract class BaseDataPermissionProvider extends PermissionProvider implements CommonPermissionProvider {
  protected dbName: string | undefined;

  withDbName(name: string) {
    this.dbName = name;
    return this;
  }

  abstract all(): string;

  abstract view(): string;

  abstract create(): string;

  abstract edit(): string;

  abstract delete(): string;
}

export class DatabasePermissionProviderImpl extends BaseDataPermissionProvider {
  all(): string {
    return this.buildPerm('database', '*', this.dbName?.toString() ?? '*');
  }

  view(): string {
    return this.buildPerm('database', 'view', this.dbName?.toString() ?? '*');
  }

  create(): string {
    return this.buildPerm('database', 'create', this.dbName?.toString() ?? '*');
  }

  edit(): string {
    return this.buildPerm('database', 'edit', this.dbName?.toString() ?? '*');
  }

  delete(): string {
    return this.buildPerm('database', 'delete', this.dbName?.toString() ?? '*');
  }
}
