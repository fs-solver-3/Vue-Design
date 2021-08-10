<template>
  <div class="string-filter-area">
    <SelectionInput :optionSelected.sync="optionSelected" :options="selectOptions" :values.sync="inputValues"></SelectionInput>
    <!--    <CollapseTransition>-->
    <div v-show="isMultiSelection">
      <DILoadMore
        ref="loadMore"
        :canLoadMore="canLoadMore"
        :initStatus="initStatus"
        :isLoadMore.sync="isLoadMore"
        :isVirtualScroll="true"
        :scrollClass="'multi-selection-area'"
        @onLoadMore="handleLoadMoreChartResponse"
      >
        <MultiSelection
          :id="genMultiSelectionId('selection-filter')"
          :model="valuesSelected"
          :options="groupOptions"
          keyField="key"
          @onScroll="handleScroll"
          @selectedColumnsChanged="handleSelectedColumnsChanged"
        />
      </DILoadMore>
    </div>
    <!--    </CollapseTransition>-->
  </div>
</template>
<script lang="ts">
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { CheckboxGroupOption, FilterConstants, FilterSelectOption, InputType, Status } from '@/shared';
import MultiSelection from '@/shared/components/MultiSelection.vue';
import { FilterProp } from '@/shared/components/filters/filter_prop.abstract';
import { ListUtils } from '@/utils';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import SelectionInput from '@/shared/components/filters/SelectionInput/SelectionInput.vue';
import { CollapseTransition } from 'vue2-transitions';
import { QueryProfileBuilder, QueryService } from '@core/services';
import { DI } from '@core/modules';
import { QueryRequest } from '@core/domain/Request';
import DILoadMore from '@/shared/components/DILoadMore.vue';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { AbstractTableResponse } from '@core/domain/Response/Query/AbstractTableResponse';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';

@Component({
  components: { SelectionInput, StatusWidget, MultiSelection, CollapseTransition, DILoadMore }
})
export default class SelectionFilter extends Vue implements FilterProp {
  @Prop({ type: Array, default: () => [] })
  defaultValues!: string[];

  @Prop({ type: String, default: '' })
  defaultOptionSelected!: string;

  @Prop({ required: true })
  profileField!: FieldDetailInfo;

  private initStatus = Status.Loading;
  private valuesSelected: string[] = [];
  private optionSelected: string = FilterConstants.DEFAULT_STRING_SELECTED;
  private canLoadMore = true;
  private isLoadMore = false;
  private records: any[][] = [];
  private inputValues: string[] = [];
  @Prop({ required: true, type: Array })
  private selectOptions!: FilterSelectOption[];

  @Ref()
  private loadMore!: DILoadMore;

  private get from(): number {
    return this.records.length;
  }

  private get groupOptions(): CheckboxGroupOption[] {
    return this.records.map((record, index) => {
      return {
        text: record[0] ?? '',
        value: record[0] || '',
        key: index
      };
    });
  }

  private get isMultiSelection() {
    return this.currentSelectOption.inputType == InputType.multiSelect;
  }

  private get currentSelectOption(): FilterSelectOption {
    return this.selectOptions.find(options => options.id == this.optionSelected) ?? this.selectOptions[0];
  }

  @Watch('optionSelected')
  handleOnOptionSelected() {
    this.updatePositionPopover();
  }

  created() {
    if (this.isMultiSelection) {
      this.handleLoadChartData();
    }
  }

  mounted() {
    this.optionSelected = this.defaultOptionSelected ?? FilterConstants.DEFAULT_STRING_SELECTED;
  }

  getCurrentOptionSelected(): string {
    return this.optionSelected;
  }

  getCurrentValues(): string[] {
    if (this.isMultiSelection) {
      return this.valuesSelected;
    } else {
      return this.inputValues;
    }
  }

  getCurrentInputType(): InputType {
    return this.currentSelectOption.inputType;
  }

  private query(): QuerySetting {
    const queryProfileBuilder: QueryProfileBuilder = DI.get(QueryProfileBuilder);
    return queryProfileBuilder.buildQueryForStringData([this.profileField]);
  }

  @Watch('defaultValues', { immediate: true })
  private handleOnDefaultValues() {
    if (ListUtils.isNotEmpty(this.defaultValues)) {
      this.valuesSelected = this.defaultValues;
      this.inputValues = this.defaultValues;
    } else {
      this.valuesSelected = [];
    }
  }

  private handleSelectedColumnsChanged(newValues: string[]) {
    this.valuesSelected = newValues;
  }

  private async handleLoadChartData() {
    this.initStatus = Status.Loading;
    const chartQueryResponse: AbstractTableResponse = await this.loadChartQueryResponse(this.from, FilterConstants.DEFAULT_LOAD_ITEM_SIZE);
    this.records = chartQueryResponse.records ?? [];
    this.updatePositionPopover();
    this.initStatus = Status.Loaded;
  }

  private loadChartQueryResponse(from: number, size: number): Promise<AbstractTableResponse> {
    const dashboardService: QueryService = DI.get(QueryService);
    const request = QueryRequest.fromQuery(this.query(), from, size);
    return dashboardService.query(request).then(r => r as AbstractTableResponse);
  }

  private async handleLoadMoreChartResponse() {
    const newQueryResponse: AbstractTableResponse = await this.loadChartQueryResponse(this.from, FilterConstants.DEFAULT_LOAD_ITEM_SIZE);
    if (ListUtils.isEmpty(newQueryResponse.records)) {
      this.handleStopLoadMore();
    } else {
      this.handleLoadMoreCompleted(newQueryResponse.records ?? []);
    }
  }

  private handleStopLoadMore() {
    this.canLoadMore = false;
    this.isLoadMore = false;
  }

  private handleLoadMoreCompleted(records: any[][]) {
    this.records = this.records.concat(records);
    this.canLoadMore = true;
    this.isLoadMore = false;
  }

  private handleScroll(process: number) {
    this.loadMore.handleScroll({ process: process });
  }

  private updatePositionPopover() {
    this.$root.$emit('filter-content-changed');
  }
}
</script>

<style lang="scss" scoped>
@import '~bootstrap/scss/bootstrap-grid';

.string-filter-area {
  ::v-deep {
    .multi-selection-area {
      margin: 15px 0;
      max-height: 400px;

      @include media-breakpoint-down(xs) {
        margin: 2px 0;
      }

      @include media-breakpoint-down(sm) {
        margin: 4px 0;
      }

      .vue-recycle-scroller {
        height: 400px;
      }
    }
  }
}
</style>
