import { BaseClient, HttpClient } from '@core/services/base.service';
import { InjectValue } from 'typescript-ioc';
import { DIKeys } from '../modules/di';
import { PermittedResponse } from '@core/domain/Response/ResouceSharing/PermittedResponse';

export abstract class PermissionRepository {
  abstract getUserPermissions(): Promise<string[]>;

  abstract isPermitted(permissions: string[]): Promise<{ [p: string]: boolean }>;
}

export class HttpPermissionRepository implements PermissionRepository {
  private apiPath = '/user/permissions';

  constructor(@InjectValue(DIKeys.authClient) private httpClient: BaseClient) {}

  getUserPermissions(): Promise<string[]> {
    return this.httpClient.get(`${this.apiPath}/me`);
  }

  isPermitted(permissions: string[]): Promise<PermittedResponse> {
    const post = {
      permissions: permissions
    };
    return this.httpClient.post(`${this.apiPath}/is_permitted`, post, undefined, undefined, require('@/workers').DIWorkers.parsePureJson);
  }
}

export class MockPermissionRepository implements PermissionRepository {
  getUserPermissions(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  isPermitted(permissions: string[]): Promise<PermittedResponse> {
    return Promise.resolve({});
  }
}
