import { Directory } from '@core/domain/Model';

export class ListParentsResponse {
  public rootDirectory: Directory;
  public isAll: boolean;
  public parentDirectories: Directory[];

  constructor(data: any) {
    this.rootDirectory = data.rootDirectory || {};
    this.isAll = data.isAll || false;
    this.parentDirectories = data.parentDirectories || [];
  }
}
