import { PermissionRepository } from '../repositories/permission.repository';
import { Inject } from 'typescript-ioc';

export abstract class PermissionService {
  abstract getUserPermissions(): Promise<string[]>;

  abstract isPermitted(permissions: string[]): Promise<{ [p: string]: boolean }>;
}

export class PermissionServiceImpl implements PermissionService {
  constructor(@Inject private repository: PermissionRepository) {}

  getUserPermissions(): Promise<string[]> {
    return this.repository.getUserPermissions();
  }

  isPermitted(permissions: string[]): Promise<{ [p: string]: boolean }> {
    return this.repository.isPermitted(permissions);
  }
}
