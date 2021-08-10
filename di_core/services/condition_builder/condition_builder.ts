import { ConditionData } from '@/shared';
import { FieldRelatedCondition } from '@core/domain/Model';

export abstract class ConditionBuilder {
  abstract buildCondition(condition: ConditionData): FieldRelatedCondition | undefined;
}
