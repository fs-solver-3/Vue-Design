<template>
  <div class="date-histogram-filter-area">
    <SelectionInput :optionSelected.sync="optionSelected" :options="selectOptions" :values.sync="values" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import SelectionInput from '@/shared/components/filters/SelectionInput/SelectionInput.vue';
import { DateHistogramConditionTypes, FilterConstants, FilterSelectOption, InputType } from '@/shared';
import { FilterProp } from '@/shared/components/filters/filter_prop.abstract';
import { ListUtils } from '@/utils';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';

@Component({
  components: { SelectionInput }
})
export default class DateHistogramFilter extends Vue implements FilterProp {
  @Prop({ type: Array, default: () => [] })
  defaultValues!: string[];
  @Prop({ type: String, default: '' })
  defaultOptionSelected!: string;
  @Prop({ required: true })
  profileField!: FieldDetailInfo;
  private optionSelected = FilterConstants.DEFAULT_DATE_SELECTED;
  private values: string[] = [];

  private get selectOptions(): FilterSelectOption[] {
    return FilterConstants.DATE_RANGE_OPTIONS;
  }

  mounted() {
    if (this.defaultOptionSelected == FilterConstants.DEFAULT_SELECTED) {
      this.optionSelected = FilterConstants.DEFAULT_DATE_SELECTED;
    } else {
      this.optionSelected = (this.defaultOptionSelected as DateHistogramConditionTypes) || FilterConstants.DEFAULT_DATE_SELECTED;
    }
  }

  getCurrentOptionSelected(): string {
    return this.optionSelected;
  }

  getCurrentValues(): string[] {
    return this.values;
  }

  getCurrentInputType(): InputType {
    const currentSelect = this.selectOptions.find(options => options.id == this.optionSelected) ?? this.selectOptions[0];
    return currentSelect.inputType;
  }

  @Watch('defaultValues', { immediate: true })
  private handleOnDefaultValues() {
    if (ListUtils.isNotEmpty(this.defaultValues)) {
      this.values = [this.defaultValues[0] ?? '', this.defaultValues[1] ?? ''];
    }
  }
}
</script>
