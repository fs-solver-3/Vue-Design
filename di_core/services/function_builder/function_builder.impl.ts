import { FunctionBuilder } from '@core/services/function_builder/function_builder';
import { AggregationFunctionTypes, DateFunctionTypes, FunctionData, FunctionFamilyTypes } from '@/shared';
import {
  Avg,
  Count,
  CountDistinct,
  FieldRelatedFunction,
  Group,
  Max,
  Min,
  Select,
  Sum,
  ToDayNum,
  ToDayOfMonth,
  ToDayOfWeek,
  ToDayOfYear,
  ToHour,
  ToHourNum,
  ToMinute,
  ToMinuteNum,
  ToMonth,
  ToMonthNum,
  ToQuarter,
  ToQuarterNum,
  ToSecond,
  ToSecondNum,
  ToWeekNum,
  ToYear,
  ToYearNum
} from '@core/domain/Model';

export class GroupByFunctionBuilderEngine implements FunctionBuilder {
  buildFunction(functionData: FunctionData): FieldRelatedFunction | undefined {
    return new Group(functionData.field);
  }
}

export class DateHistogramFunctionBuilder implements FunctionBuilder {
  private readonly builderAsMap: Map<string, (func: FieldRelatedFunction, functionData: FunctionData) => FieldRelatedFunction>;

  constructor() {
    this.builderAsMap = this.buildBuilderForDateHistogram();
  }

  buildFunction(functionData: FunctionData): FieldRelatedFunction | undefined {
    const group = new Group(functionData.field);
    if (functionData.functionType) {
      const builder = this.builderAsMap.get(functionData.functionType);
      if (builder) {
        return builder(group, functionData);
      }
    } else {
      return group;
    }
  }

  private buildBuilderForDateHistogram(): Map<string, (func: FieldRelatedFunction, functionData: FunctionData) => FieldRelatedFunction> {
    return new Map<string, (func: FieldRelatedFunction, functionData: FunctionData) => FieldRelatedFunction>([
      [DateFunctionTypes.secondOf, (fn, _) => fn.setScalarFunction(new ToSecondNum())],
      [DateFunctionTypes.minuteOf, (fn, _) => fn.setScalarFunction(new ToMinuteNum())],
      [DateFunctionTypes.hourOf, (fn, _) => fn.setScalarFunction(new ToHourNum())],
      [DateFunctionTypes.dayOf, (fn, _) => fn.setScalarFunction(new ToDayNum())],
      [DateFunctionTypes.weekOf, (fn, _) => fn.setScalarFunction(new ToWeekNum())],
      [DateFunctionTypes.monthOf, (fn, _) => fn.setScalarFunction(new ToMonthNum())],
      [DateFunctionTypes.quarterOf, (fn, _) => fn.setScalarFunction(new ToQuarterNum())],
      [DateFunctionTypes.yearlyOf, (fn, _) => fn.setScalarFunction(new ToYearNum())],
      [DateFunctionTypes.hourOfDay, (fn, _) => fn.setScalarFunction(new ToHour())],
      [DateFunctionTypes.dayOfWeek, (fn, _) => fn.setScalarFunction(new ToDayOfWeek())],
      [DateFunctionTypes.dayOfMonth, (fn, _) => fn.setScalarFunction(new ToDayOfMonth())],
      [DateFunctionTypes.dayOfYear, (fn, _) => fn.setScalarFunction(new ToDayOfYear())],
      [DateFunctionTypes.monthOfYear, (fn, _) => fn.setScalarFunction(new ToMonth())],
      [DateFunctionTypes.year, (fn, _) => fn.setScalarFunction(new ToYear())],
      [DateFunctionTypes.quarterOfYear, (fn, _) => fn.setScalarFunction(new ToQuarter())],
      [DateFunctionTypes.minuteOfHour, (fn, _) => fn.setScalarFunction(new ToMinute())],
      [DateFunctionTypes.secondOfMinute, (fn, _) => fn.setScalarFunction(new ToSecond())]
    ]);
  }
}

export class AggregationFunctionBuilder implements FunctionBuilder {
  private readonly builderAsMap: Map<string, (functionData: FunctionData) => FieldRelatedFunction>;

  constructor() {
    this.builderAsMap = this.buildBuilderForDateHistogram();
  }

  buildFunction(functionData: FunctionData): FieldRelatedFunction | undefined {
    const builder = this.builderAsMap.get(functionData.functionType || '');
    if (builder) {
      return builder(functionData);
    } else {
      return void 0;
    }
  }

  private buildBuilderForDateHistogram(): Map<string, (functionData: FunctionData) => FieldRelatedFunction> {
    return new Map<string, (functionData: FunctionData) => FieldRelatedFunction>([
      [AggregationFunctionTypes.average, functionData => new Avg(functionData.field)],
      [AggregationFunctionTypes.sum, functionData => new Sum(functionData.field)],
      // [AggregationFunctionTypes.columnRatio, (functionData) => new Avg(functionData.field)],
      [AggregationFunctionTypes.maximum, functionData => new Max(functionData.field)],
      [AggregationFunctionTypes.minimum, functionData => new Min(functionData.field)],
      [AggregationFunctionTypes.countOfDistinct, functionData => new CountDistinct(functionData.field)],
      [AggregationFunctionTypes.countAll, functionData => new Count(functionData.field)]
    ]);
  }
}

export class SelectFunctionBuilder implements FunctionBuilder {
  buildFunction(functionData: FunctionData): FieldRelatedFunction | undefined {
    return new Select(functionData.field);
  }
}

export class MainFunctionBuilder implements FunctionBuilder {
  private readonly builderAsMap: Map<string, FunctionBuilder>;

  constructor() {
    this.builderAsMap = this.buildListBuilder();
  }

  buildFunction(functionData: FunctionData): FieldRelatedFunction | undefined {
    const builder = this.builderAsMap.get(functionData.functionFamily);
    if (builder) {
      return builder.buildFunction(functionData);
    } else {
      return void 0;
    }
  }

  private buildListBuilder(): Map<string, FunctionBuilder> {
    const map = new Map<string, FunctionBuilder>();
    map
      .set(FunctionFamilyTypes.groupBy, new GroupByFunctionBuilderEngine())
      .set(FunctionFamilyTypes.dateHistogram, new DateHistogramFunctionBuilder())
      .set(FunctionFamilyTypes.aggregation, new AggregationFunctionBuilder())
      .set(FunctionFamilyTypes.none, new SelectFunctionBuilder());
    return map;
  }
}
