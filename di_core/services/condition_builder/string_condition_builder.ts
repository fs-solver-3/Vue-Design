/*
 * @author: tvc12 - Thien Vi
 * @created: 1/8/21, 10:55 AM
 */
/* eslint max-len: 0 */

import { ConditionBuilder } from '@core/services/condition_builder/condition_builder';
import {
  Equal,
  Field,
  FieldRelatedCondition,
  In,
  Like,
  LikeCaseInsensitive,
  MatchRegex,
  NotEqual,
  NotIn,
  NotLike,
  NotLikeCaseInsensitive,
  NotNull,
  Null
} from '@core/domain/Model';
import { ConditionData, NumberConditionTypes, StringConditionTypes } from '@/shared';
import { createConditionIfPassChecking, isNotEmpty } from '@core/services/condition_builder/number_condition_builder';
import { ListUtils } from '@/utils';

export class StringConditionBuilder implements ConditionBuilder {
  private readonly builderAsMap: Map<string, (field: Field, firstValue: string, secondValue: string, allValues: string[]) => FieldRelatedCondition | undefined>;

  constructor() {
    this.builderAsMap = this.buildBuilder();
  }

  buildCondition(condition: ConditionData): FieldRelatedCondition | undefined {
    const firstValue = condition.firstValue ?? '';
    const secondValue = condition.secondValue ?? '';
    const allValues = condition.allValues ?? [];
    const field = condition.field;

    const builder = this.builderAsMap.get(condition.subType || '');
    if (builder) {
      return builder(field, firstValue, secondValue, allValues.filter(isNotEmpty));
    }
  }

  private buildBuilder() {
    const builders = new Map<string, (field: Field, firstValue: string, secondValue: string, allValues: string[]) => FieldRelatedCondition | undefined>();
    builders
      .set(NumberConditionTypes.in, (field, firstValue, secondValue, allValues) =>
        createConditionIfPassChecking(ListUtils.isNotEmpty(allValues), () => new In(field, allValues))
      )
      .set(NumberConditionTypes.notIn, (field, firstValue, secondValue, allValues) =>
        createConditionIfPassChecking(ListUtils.isNotEmpty(allValues), () => new NotIn(field, allValues))
      )
      .set(NumberConditionTypes.equal, (field, firstValue) => createConditionIfPassChecking(isNotEmpty(firstValue), () => new Equal(field, firstValue)))
      .set(NumberConditionTypes.notEqual, (field, firstValue) => createConditionIfPassChecking(isNotEmpty(firstValue), () => new NotEqual(field, firstValue)))
      .set(StringConditionTypes.isnull, field => new Null(field))
      .set(StringConditionTypes.notNull, field => new NotNull(field))
      .set(StringConditionTypes.like, (field, firstValue) => createConditionIfPassChecking(isNotEmpty(firstValue), () => new Like(field, firstValue)))
      .set(StringConditionTypes.notLike, (field, firstValue) => createConditionIfPassChecking(isNotEmpty(firstValue), () => new NotLike(field, firstValue)))
      .set(StringConditionTypes.matchesRegex, (field, firstValue) =>
        createConditionIfPassChecking(isNotEmpty(firstValue), () => new MatchRegex(field, firstValue))
      )
      .set(StringConditionTypes.likeCaseInsensitive, (field, firstValue) =>
        createConditionIfPassChecking(isNotEmpty(firstValue), () => new LikeCaseInsensitive(field, firstValue))
      )
      .set(StringConditionTypes.notLikeCaseInsensitive, (field, firstValue) =>
        createConditionIfPassChecking(isNotEmpty(firstValue), () => new NotLikeCaseInsensitive(field, firstValue))
      );
    return builders;
  }
}
