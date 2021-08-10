import {
  Avg,
  Field,
  FieldRelatedFunction,
  FilterWidget,
  GetArrayElement,
  Max,
  Min,
  OrderBy,
  Select,
  SelectDistinct,
  TableColumn,
  TableQueryChartSetting
} from '@core/domain/Model';
import { FilterRequest, QueryRequest, SortDirection } from '@core/domain/Request';
import { QueryProfileBuilder } from './query_profile.builder';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';
import { Column } from 'ant-design-vue/types/table/column';

export class QueryProfileBuilderImpl extends QueryProfileBuilder {
  private static buildFunctionByCreatorFn(profileField: FieldDetailInfo, creatorFn: (field: Field) => FieldRelatedFunction): FieldRelatedFunction {
    const fn = creatorFn(profileField.field);
    if (profileField.isNested) {
      if (fn.scalarFunction) {
        fn.scalarFunction.withScalarFunction(new GetArrayElement());
      } else {
        fn.setScalarFunction(new GetArrayElement());
      }
    }
    return fn;
  }

  private static buildMinMaxAvgFunction(profileField: FieldDetailInfo): FieldRelatedFunction[] {
    const minFunction = QueryProfileBuilderImpl.buildFunctionByCreatorFn(profileField, field => new Min(field));
    const maxFunction = QueryProfileBuilderImpl.buildFunctionByCreatorFn(profileField, field => new Max(field));
    const avgFunction = QueryProfileBuilderImpl.buildFunctionByCreatorFn(profileField, field => new Avg(field));
    return [minFunction, maxFunction, avgFunction];
  }

  private static buildMinMaxAvgColumns(fieldRelatedFunctions: FieldRelatedFunction[]): TableColumn[] {
    return fieldRelatedFunctions.map((fn, index) => {
      return new TableColumn(index.toString(), fn, false, false, true);
    });
  }

  buildTableQuerySetting(profileFields: FieldDetailInfo[]): TableQueryChartSetting {
    const columns = this.buildTableColumns(profileFields);
    return new TableQueryChartSetting(columns);
  }

  buildQueryForStringData(profileFields: FieldDetailInfo[]): TableQueryChartSetting {
    const columns = this.buildTableColumnsForStringData(profileFields);
    const sorts = columns.map(column => new OrderBy(column.function, SortDirection.Asc));
    return new TableQueryChartSetting(columns, [], sorts);
  }

  buildFunctions(profileFields: FieldDetailInfo[]): FieldRelatedFunction[] {
    return profileFields.map(this.buildFunction);
  }

  buildFunction(profileField: FieldDetailInfo): FieldRelatedFunction {
    return QueryProfileBuilderImpl.buildFunctionByCreatorFn(profileField, field => new Select(field));
  }

  buildFilterRequest(filter: FilterWidget): FilterRequest | undefined {
    return filter.toFilterRequest();
  }

  buildFilterRequests(filters: FilterWidget[]): FilterRequest[] {
    return filters.map(this.buildFilterRequest).filter((maybeFilter): maybeFilter is FilterRequest => maybeFilter instanceof FilterRequest);
  }

  buildQueryMinMaxAvgRequest(profileField: FieldDetailInfo): QueryRequest {
    const functions: FieldRelatedFunction[] = QueryProfileBuilderImpl.buildMinMaxAvgFunction(profileField);
    const columns = QueryProfileBuilderImpl.buildMinMaxAvgColumns(functions);
    const tableQuery = new TableQueryChartSetting(columns);
    return QueryRequest.fromQuery(tableQuery, -1, -1);
  }

  private buildTableColumns(profileFields: FieldDetailInfo[]): TableColumn[] {
    return profileFields.map((profileField: FieldDetailInfo) => {
      const func = this.buildFunction(profileField);
      return new TableColumn(profileField.displayName, func, false, false, true);
    });
  }

  private buildTableColumnsForStringData(profileFields: FieldDetailInfo[]): TableColumn[] {
    return profileFields.map(profileField => {
      const func = QueryProfileBuilderImpl.buildFunctionByCreatorFn(profileField, field => new SelectDistinct(profileField.field));
      return new TableColumn(profileField.displayName, func, false, false, true);
    });
  }
}
