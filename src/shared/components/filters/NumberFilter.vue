<template>
  <div class="number-filter-area">
    <SelectionInput :optionSelected.sync="optionSelected" :options="numberOptions" :values.sync="values" />
    <div class="aggregation-area">
      <StatusWidget :status="currentStatus" error="Load min, avg, max data error" @retry="handleLoadMinMaxAvg">
        <div class="d-flex flex-row align-items-center aggregation-listing-area text-nowrap overflow-auto">
          <div v-b-tooltip.d800.viewport="`Min: ${min}`">
            Min: <span>{{ min }}</span>
          </div>
          <div v-b-tooltip.d800.viewport="`Avg: ${avg}`">
            Avg: <span>{{ avg }}</span>
          </div>
          <div v-b-tooltip.d800.viewport="`Max: ${max}`">
            Max: <span>{{ max }}</span>
          </div>
        </div>
      </StatusWidget>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import SelectionInput from '@/shared/components/filters/SelectionInput/SelectionInput.vue';
import { FilterConstants, FilterSelectOption, InputType, NumberConditionTypes, Status } from '@/shared';
import { FilterProp } from '@/shared/components/filters/filter_prop.abstract';
import { ListUtils } from '@/utils';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { QueryProfileBuilder, QueryService } from '@core/services';
import { DI } from '@core/modules';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';
import { QueryRequest } from '@core/domain/Request';
import { AbstractTableResponse } from '@core/domain/Response/Query/AbstractTableResponse';
import { Log } from '@core/utils';

@Component({
  components: { StatusWidget, SelectionInput }
})
export default class NumberFilter extends Vue implements FilterProp {
  @Prop({ type: Array, default: () => [] })
  defaultValues!: string[];
  @Prop({ type: String, default: '' })
  defaultOptionSelected!: string;
  @Prop({ required: true })
  profileField!: FieldDetailInfo;
  private records: any[] = FilterConstants.DEFAULT_RECORD_VALUE;
  private optionSelected = FilterConstants.DEFAULT_NUMBER_SELECTED;
  private currentStatus = Status.Loading;
  private values: string[] = [];

  private get previewMinMaxAvgRequest(): QueryRequest {
    const queryProfileBuilder: QueryProfileBuilder = DI.get(QueryProfileBuilder);
    return queryProfileBuilder.buildQueryMinMaxAvgRequest(this.profileField);
  }

  private get min(): string {
    return this.records[0];
  }

  private get max(): string {
    return this.records[1];
  }

  private get avg(): string {
    return this.records[2];
  }

  private get numberOptions(): FilterSelectOption[] {
    return FilterConstants.NUMBER_RANGE_OPTIONS;
  }

  created() {
    this.handleLoadMinMaxAvg();
  }

  mounted() {
    this.optionSelected = (this.defaultOptionSelected as NumberConditionTypes) || FilterConstants.DEFAULT_NUMBER_SELECTED;
    if (ListUtils.isNotEmpty(this.defaultValues)) {
      this.values = Array.from(this.defaultValues);
    }
  }

  getCurrentOptionSelected(): string {
    return this.optionSelected;
  }

  getCurrentValues(): string[] {
    return this.values;
  }

  getCurrentInputType(): InputType {
    const currentSelect = this.numberOptions.find(options => options.id == this.optionSelected) ?? this.numberOptions[0];
    return currentSelect.inputType;
  }

  private async handleLoadMinMaxAvg() {
    const dashboardService: QueryService = DI.get(QueryService);
    try {
      const previewChartQuery: AbstractTableResponse = await dashboardService.query(this.previewMinMaxAvgRequest).then(r => r as AbstractTableResponse);
      this.records = previewChartQuery?.records[0] ?? FilterConstants.DEFAULT_RECORD_VALUE;
      this.currentStatus = Status.Loaded;
    } catch (ex) {
      Log.debug('handleLoadMinMaxAvg::error', ex);
      this.records = FilterConstants.DEFAULT_RECORD_VALUE;
      this.currentStatus = Status.Error;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.number-filter-area {
  .aggregation-area {
    margin-top: 24px;
  }

  .aggregation-listing-area {
    > div {
      @include semi-bold-text();
      color: white;
      font-size: 14px;
      letter-spacing: 0.6px;

      > span {
        @include regular-text();
        font-size: 14px;
        letter-spacing: 0.6px;
      }
    }

    > div + div {
      margin-left: 16px;
    }
  }
}
</style>
