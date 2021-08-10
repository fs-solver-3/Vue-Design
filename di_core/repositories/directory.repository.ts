import { InjectValue } from 'typescript-ioc';

import { DirectoryId } from '@core/domain/Model/DefinedType';
import { Directory } from '@core/domain/Model/Directory/Directory';
import { DIKeys } from '@core/modules/di';
import { DirectoryPagingRequest, CreateDirectoryRequest, ListDirectoryRequest } from '@core/domain/Request';
import { ListParentsResponse, PageResult } from '@core/domain/Response';
import { BaseClient } from '@core/services/base.service';

export abstract class DirectoryRepository {
  abstract get(id: DirectoryId): Promise<Directory>;

  abstract create(request: CreateDirectoryRequest): Promise<Directory>;

  abstract list(id: DirectoryId, sort: DirectoryPagingRequest): Promise<Directory[]>;

  abstract quickList(request: ListDirectoryRequest): Promise<PageResult<Directory>>;

  abstract rename(id: DirectoryId, toName: string): Promise<boolean>;

  abstract delete(id: DirectoryId): Promise<boolean>;

  abstract move(id: DirectoryId, toParentId: DirectoryId): Promise<boolean>;

  abstract remove(id: DirectoryId): Promise<boolean>;

  abstract restore(id: DirectoryId): Promise<boolean>;

  abstract getParents(id: DirectoryId): Promise<ListParentsResponse>;

  abstract getRootDir(): Promise<Directory>;
}

export class HttpDirectoryRepository extends DirectoryRepository {
  @InjectValue(DIKeys.authClient)
  private httpClient!: BaseClient;
  private apiPath = '/directories';

  get(id: DirectoryId): Promise<Directory> {
    return this.httpClient.get<Directory>(`${this.apiPath}/${id}`);
  }

  create(request: CreateDirectoryRequest): Promise<Directory> {
    return this.httpClient.post<Directory>(`${this.apiPath}/create`, request);
  }

  list(id: DirectoryId, sort: DirectoryPagingRequest): Promise<Directory[]> {
    return this.httpClient.post<Directory[]>(`${this.apiPath}/${id}/list`, sort);
  }

  quickList(request: ListDirectoryRequest): Promise<PageResult<Directory>> {
    return this.httpClient.post<PageResult<Directory>>(`${this.apiPath}/quick_list`, request);
  }

  rename(id: DirectoryId, toName: string): Promise<boolean> {
    return this.httpClient
      .put(`${this.apiPath}/${id}/rename`, {
        toName: toName
      })
      .then(_ => true);
  }

  delete(id: DirectoryId): Promise<boolean> {
    return this.httpClient.delete(`${this.apiPath}/${id}`).then(_ => true);
  }

  move(id: DirectoryId, toParentId: DirectoryId): Promise<boolean> {
    return this.httpClient
      .put(`${this.apiPath}/${id}/move`, {
        toParentId: toParentId
      })
      .then(_ => true);
  }

  remove(id: DirectoryId): Promise<boolean> {
    return this.httpClient.put(`${this.apiPath}/${id}/remove`).then(_ => true);
  }

  restore(id: DirectoryId): Promise<boolean> {
    return this.httpClient.put(`${this.apiPath}/${id}/restore`).then(_ => true);
  }

  getParents(id: DirectoryId): Promise<ListParentsResponse> {
    return this.httpClient.get<ListParentsResponse>(`${this.apiPath}/${id}/parents`);
  }

  getRootDir(): Promise<Directory> {
    return this.httpClient.get<Directory>(`${this.apiPath}/root`);
  }
}
