import { Inject } from 'typescript-ioc';
import { PermissionTokenResponse } from '@core/domain/Response';
import {
  CheckActionPermittedRequest,
  GetUserSharingInfoRequest,
  RevokeShareAnyoneRequest,
  RevokeShareRequest,
  ShareAnyoneRequest,
  ShareWithUserRequest,
  UpdateShareRequest
} from '@core/domain/Request/ShareRequest';
import { ResourceType } from '@/utils/permission_utils';
import { ShareRepository } from '@core/share/repository/share_repository';
import { ResourceSharingInfo } from '@core/domain/Response/ResouceSharing/ResourceSharingInfo';

export abstract class ShareService {
  abstract getUserSharingInfo(request: GetUserSharingInfoRequest): Promise<ResourceSharingInfo>;

  abstract editSharedPermission(request: UpdateShareRequest): Promise<Map<string, string[]>>;

  abstract revokeSharedPermission(request: RevokeShareRequest): Promise<Map<string, boolean>>;

  abstract create(request: ShareWithUserRequest): Promise<Map<string, boolean>>;

  abstract shareWithAnyone(request: ShareAnyoneRequest): Promise<PermissionTokenResponse>;

  abstract updateShareAnyone(request: ShareAnyoneRequest): Promise<boolean>;

  abstract getShareAnyoneInfo(request: { resourceType: ResourceType; resourceId: number }): Promise<PermissionTokenResponse | null>;

  abstract revokeShareWithAnyone(request: RevokeShareAnyoneRequest): Promise<boolean>;

  abstract isPermittedForUser(request: CheckActionPermittedRequest): Promise<Map<string, boolean>>;
}
export class ShareServiceImpl implements ShareService {
  @Inject
  shareRepository!: ShareRepository;

  getUserSharingInfo(request: GetUserSharingInfoRequest): Promise<ResourceSharingInfo> {
    return this.shareRepository.getUserSharingInfo(request);
  }

  create(request: ShareWithUserRequest): Promise<Map<string, boolean>> {
    return this.shareRepository.create(request);
  }

  editSharedPermission(request: UpdateShareRequest): Promise<Map<string, string[]>> {
    return this.shareRepository.editSharedPermission(request);
  }

  revokeSharedPermission(request: RevokeShareRequest): Promise<Map<string, boolean>> {
    return this.shareRepository.revokeSharedPermission(request);
  }

  shareWithAnyone(request: ShareAnyoneRequest): Promise<PermissionTokenResponse> {
    return this.shareRepository.shareWithAnyone(request);
  }

  updateShareAnyone(request: ShareAnyoneRequest): Promise<boolean> {
    return this.shareRepository.updateShareAnyone(request);
  }

  getShareAnyoneInfo(request: { resourceType: ResourceType; resourceId: number }): Promise<PermissionTokenResponse | null> {
    return this.shareRepository.getShareAnyoneInfo(request);
  }

  shareAnyone(request: ShareAnyoneRequest) {
    return this.shareRepository.shareWithAnyone(request);
  }

  revokeShareWithAnyone(request: RevokeShareAnyoneRequest): Promise<boolean> {
    return this.shareRepository.revokeShareWithAnyone(request);
  }

  isPermittedForUser(request: CheckActionPermittedRequest): Promise<Map<string, boolean>> {
    return this.shareRepository.isPermittedForUser(request);
  }
}
