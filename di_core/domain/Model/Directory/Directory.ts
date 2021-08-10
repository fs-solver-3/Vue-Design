/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 10:11 PM
 */

import { DashboardId, DDate, DirectoryId, UserId } from '../DefinedType';
import { Owner } from '@core/domain/Model/Directory/Owner';
import { DirectoryType } from '@core/domain/Model';

export class Directory {
  public id: DirectoryId;
  public name: string;
  public owner: Owner;
  public createdDate: DDate;
  public ownerId: UserId;
  public parentId: DirectoryId;
  public parentDirectory: Directory;
  public directoryType: DirectoryType;
  public dashboardId?: DashboardId;

  constructor(
    id: DirectoryId,
    name: string,
    owner: Owner,
    createdDate: DDate,
    ownerId: UserId,
    parentId: DirectoryId,
    parentDirectory: Directory,
    directoryType: DirectoryType,
    dashboardId?: DashboardId
  ) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.createdDate = createdDate;
    this.ownerId = ownerId;
    this.parentId = parentId;
    this.parentDirectory = parentDirectory;
    this.directoryType = directoryType;
    this.dashboardId = dashboardId;
  }

  static fromObject(obj: Directory): Directory {
    const parentDirectory = obj.parentDirectory ? Directory.fromObject(obj.parentDirectory) : {};
    const owner = obj.owner ? Owner.fromObject(obj.owner) : {};
    return new Directory(
      obj.id,
      obj.name,
      owner as Owner,
      obj.createdDate,
      obj.ownerId,
      obj.parentId,
      parentDirectory as Directory,
      obj.directoryType,
      obj.dashboardId
    );
  }
}
