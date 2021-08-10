import { FieldRelatedCondition, WidgetId } from '@core/domain/Model';

export class FilterRequest {
  filterId!: WidgetId;
  condition!: FieldRelatedCondition;
  isApplyRelatively = true;
  isActive = true;

  constructor(filterId: WidgetId, condition: FieldRelatedCondition, isApplyRelatively = true, isActive = true) {
    this.filterId = filterId;
    this.condition = condition;
    this.isApplyRelatively = isApplyRelatively;
    this.isActive = isActive;
  }
}
