import { SuggestionCommand } from '@/screens/DataIngestion/interfaces/SuggestionCommand';
import { DataSourceModule } from '@/screens/DataIngestion/store/DataSourceStore';
import { SourceId } from '@core/domain';

export class DatabaseSuggestionCommand implements SuggestionCommand {
  constructor(public sourceId: SourceId) {}

  load(): Promise<string[]> {
    return DataSourceModule.loadDatabaseName(this.sourceId);
  }
}
