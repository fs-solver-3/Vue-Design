/*
 * @author: tvc12 - Thien Vi
 * @created: 12/16/20, 3:33 PM
 */

import { Between, BetweenAndIncluding, Field, FieldRelatedCondition, GetArrayElement, VizSettingType } from '@core/domain/Model';
import { CompareRequest } from '@core/domain/Request';
import { DateRange } from '@/shared';
import { CompareBuilder, CompareResolver } from '@core/services';
import { InjectValue } from 'typescript-ioc';
import { DIKeys } from '@core/modules';
import DateTimeFormat = Intl.DateTimeFormat;
import { FormatDateTime } from '@/utils';
import { ConditionUtils } from '@core/utils';
import moment from 'moment';

export class MainDateCompareResolver implements CompareResolver {
  private chartType!: VizSettingType;
  private field!: Field;
  private currentRange!: DateRange;
  private compareRange!: DateRange;

  @InjectValue(DIKeys.compareBuilder)
  private builders!: Map<string, CompareBuilder>;

  withChartType(chartType: VizSettingType): MainDateCompareResolver {
    this.chartType = chartType;
    return this;
  }

  withField(field: Field): MainDateCompareResolver {
    this.field = field;
    return this;
  }

  withCurrentRange(range: DateRange): MainDateCompareResolver {
    this.currentRange = this.formatDateRange(range);
    return this;
  }

  withCompareRange(range: DateRange): MainDateCompareResolver {
    this.compareRange = this.formatDateRange(range);
    return this;
  }

  private formatDateRange(range: DateRange): DateRange {
    return {
      start: FormatDateTime.formatDate(range.start),
      end: FormatDateTime.formatDate(range.end)
    };
  }

  build(): CompareRequest | undefined {
    const builder = this.builders.get(this.chartType);
    const firstCondition = ConditionUtils.buildMainDateCondition(this.field, this.currentRange);
    const secondCondition = ConditionUtils.buildMainDateCondition(this.field, this.compareRange);
    if (builder) {
      return builder.buildCompareRequest(firstCondition, secondCondition);
    } else {
      return void 0;
    }
  }
}
