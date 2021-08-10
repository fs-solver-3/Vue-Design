import { SuggestionCommand } from '@/screens/DataIngestion/interfaces/SuggestionCommand';
import { SourceId } from '@core/domain';
import { DataSourceModule } from '@/screens/DataIngestion/store/DataSourceStore';

export class TableSuggestionCommand implements SuggestionCommand {
  constructor(public sourceId: SourceId, public databaseName: string) {}

  load(): Promise<string[]> {
    return DataSourceModule.loadTableNames({ id: this.sourceId, dbName: this.databaseName });
  }
}
