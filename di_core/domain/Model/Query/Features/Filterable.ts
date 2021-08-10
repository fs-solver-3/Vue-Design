import { TableColumn } from '@core/domain/Model';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';

export abstract class Filterable {
  abstract getFilter(): TableColumn;

  static isFilterable(query: QuerySetting | Filterable): query is Filterable {
    return (query as Filterable).getFilter !== undefined;
  }
}
