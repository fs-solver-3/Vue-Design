export class TableCreationFromQueryRequest {
  constructor(public dbName: string, public displayName: string, public tblName: string, public query: string) {}
}
