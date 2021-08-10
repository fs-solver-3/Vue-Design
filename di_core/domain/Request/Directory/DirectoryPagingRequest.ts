export class DirectoryPagingRequest {
  public sorts: Sort[];
  public from: number;
  public size: number;

  constructor(data: any = {}) {
    this.sorts = data.sorts || void 0;
    this.from = data.from || 0;
    this.size = data.size || 10000; // TODO: must change when applying the paging feature
  }
}

export class Sort {
  public field: string;
  public order: string;

  constructor(data: any = {}) {
    this.field = data.field || void 0;
    this.order = data.order || 0;
  }
}

export enum SortDirection {
  Desc = 'DESC',
  Asc = 'ASC'
}
