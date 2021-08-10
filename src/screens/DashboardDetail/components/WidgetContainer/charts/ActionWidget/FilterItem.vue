<template>
  <div class="filter-item">
    {{ name }}
    <span> {{ condition }}</span>
    {{ value }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FilterRequest } from '@core/domain/Request';
import { ValueCondition } from '@core/domain/Model/Condition/ValueCondition';

@Component
export default class FilterListingItem extends Vue {
  @Prop({ required: true, type: Object })
  filterRequest!: FilterRequest;

  private get name(): string {
    return this.filterRequest.condition.field.fieldName.replace('_', ' ');
  }

  private get condition(): string {
    const conditionKey = this.filterRequest.condition.className;
    return conditionKey.replace('_', ' ');
  }

  private get value(): string {
    if (ValueCondition.isValueCondition(this.filterRequest.condition)) {
      const values = this.filterRequest.condition.getValues();
      const hasOnlyValue = values.length == 1;
      if (hasOnlyValue) {
        return values[0];
      } else {
        return values.join(', ');
      }
    }
    return '0';
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.filter-item {
  @include regular-text-14();
  margin: 0 12px 0 12px;
  text-transform: capitalize;

  span {
    opacity: 0.5;
    text-transform: none;
  }
}
</style>
