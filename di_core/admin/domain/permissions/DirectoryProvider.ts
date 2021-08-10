import { CommonPermissionProvider } from '@core/admin/domain/permissions/CommonPermissionProvider';
import { PermissionProvider } from '@core/admin/domain/permissions/PermissionProvider';

export abstract class BaseDirectoryPermissionProvider extends PermissionProvider implements CommonPermissionProvider {
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

  abstract copy(): string;
}

export class DirectoryPermissionProviderImpl extends BaseDirectoryPermissionProvider {
  all(): string {
    return this.buildPerm('directory', '*', this.id?.toString() ?? '*');
  }

  view(): string {
    return this.buildPerm('directory', 'view', this.id?.toString() ?? '*');
  }

  create(): string {
    return this.buildPerm('directory', 'create', this.id?.toString() ?? '*');
  }

  edit(): string {
    return this.buildPerm('directory', 'edit', this.id?.toString() ?? '*');
  }

  delete(): string {
    return this.buildPerm('directory', 'delete', this.id?.toString() ?? '*');
  }

  copy(): string {
    return this.buildPerm('directory', 'copy', this.id?.toString() ?? '*');
  }
}
