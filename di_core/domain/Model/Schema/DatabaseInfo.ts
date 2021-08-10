export class DatabaseInfo {
  name!: string;
  organizationId!: number;
  displayName!: string;

  constructor(name: string, organizationId: number, displayName: string) {
    this.name = name;
    this.organizationId = organizationId;
    this.displayName = displayName;
  }

  static fromObject(obj: DatabaseInfo): DatabaseInfo {
    return new DatabaseInfo(obj.name, obj.organizationId, obj.displayName);
  }
}
