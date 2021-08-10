import { ConditionBuilder } from '@core/services/condition_builder/condition_builder';
import { ConditionData, ConditionFamilyTypes } from '@/shared';
import { FieldRelatedCondition } from '@core/domain/Model';
import { DateHistogramConditionBuilder } from '@core/services/condition_builder/date_histogram_condition_builder';
import { NumberConditionBuilder } from '@core/services/condition_builder/number_condition_builder';
import { StringConditionBuilder } from '@core/services/condition_builder/string_condition_builder';

export class GeospatialConditionBuilder implements ConditionBuilder {
  buildCondition(condition: ConditionData): FieldRelatedCondition | undefined {
    return undefined;
  }
}

export class CustomConditionBuilder implements ConditionBuilder {
  buildCondition(condition: ConditionData): FieldRelatedCondition | undefined {
    return undefined;
  }
}

export class MainConditionBuilder implements ConditionBuilder {
  private readonly builderAsMap: Map<string, ConditionBuilder>;

  constructor() {
    this.builderAsMap = this.buildBuilders();
  }

  buildCondition(condition: ConditionData): FieldRelatedCondition | undefined {
    const builder = this.builderAsMap.get(condition.familyType);
    return builder?.buildCondition(condition);
  }

  private buildBuilders() {
    const builders = new Map<string, ConditionBuilder>();
    builders
      .set(ConditionFamilyTypes.dateHistogram, new DateHistogramConditionBuilder())
      .set(ConditionFamilyTypes.number, new NumberConditionBuilder())
      .set(ConditionFamilyTypes.string, new StringConditionBuilder());
    // .set(ConditionFamilyTypes.custom, new CustomConditionBuilder())
    // .set(ConditionFamilyTypes.geospatial, new GeospatialConditionBuilder());

    return builders;
  }
}
