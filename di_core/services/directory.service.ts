import { Inject } from 'typescript-ioc';

import { DirectoryRepository } from '../repositories';
import { DirectoryId } from '@core/domain/Model/DefinedType';
import { Directory } from '@core/domain/Model/Directory/Directory';
import { CreateDirectoryRequest, DirectoryPagingRequest, ListDirectoryRequest } from '@core/domain/Request';
import { ListParentsResponse, PageResult } from '@core/domain/Response';

export abstract class DirectoryService {
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

export class DirectoryServiceImpl extends DirectoryService {
  constructor(@Inject private directoryRepository: DirectoryRepository) {
    super();
  }

  get(id: DirectoryId): Promise<Directory> {
    return this.directoryRepository.get(id);
  }

  create(request: CreateDirectoryRequest): Promise<Directory> {
    return this.directoryRepository.create(request);
  }

  list(id: DirectoryId, sort: DirectoryPagingRequest): Promise<Directory[]> {
    return this.directoryRepository.list(id, sort);
  }

  quickList(request: ListDirectoryRequest): Promise<PageResult<Directory>> {
    return this.directoryRepository.quickList(request);
  }

  rename(id: DirectoryId, toName: string): Promise<boolean> {
    return this.directoryRepository.rename(id, toName);
  }

  delete(id: DirectoryId): Promise<boolean> {
    return this.directoryRepository.delete(id);
  }

  move(id: DirectoryId, toParentId: DirectoryId): Promise<boolean> {
    return this.directoryRepository.move(id, toParentId);
  }

  remove(id: DirectoryId): Promise<boolean> {
    return this.directoryRepository.remove(id);
  }

  restore(id: DirectoryId): Promise<boolean> {
    return this.directoryRepository.restore(id);
  }

  getParents(id: DirectoryId): Promise<ListParentsResponse> {
    return this.directoryRepository.getParents(id);
  }

  getRootDir(): Promise<Directory> {
    return this.directoryRepository.getRootDir();
  }
}
