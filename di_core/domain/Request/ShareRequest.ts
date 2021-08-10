import { ResourceType } from '@/utils/permission_utils';

export interface UpdateShareRequest {
  resourceType: string;
  resourceId: number;
  shareIdActions: Map<string, string[]>;
}

export interface RevokeShareRequest {
  resourceType: string;
  resourceId: number;
  usernames: string[];
}

export interface ShareWithUserRequest {
  resourceType: string;
  resourceId: number;
  userActions: Map<string, string[]>;
}

export class GetUserSharingInfoRequest {
  constructor(public resourceType: string, public resourceId: number, public from: number, public size: number) {}

  static fromObject(obj: any) {
    return new GetUserSharingInfoRequest(obj.resourceType, obj.resourceId, obj.from, obj.size);
  }
}

export interface ShareAnyoneRequest {
  resourceType: string;
  resourceId: number;
  actions: string[];
}

export interface CheckActionPermittedRequest {
  resourceType: string;
  resourceId: number;
  actions: string[];
}

export interface CheckTokenActionPermittedRequest {
  tokenId: string;
  resourceType: string;
  resourceId: number;
  actions: string[];
}

export interface RevokeShareAnyoneRequest {
  resourceType: ResourceType;
  resourceId: number;
}
