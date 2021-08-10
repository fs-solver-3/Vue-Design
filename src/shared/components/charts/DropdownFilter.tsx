import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import { SelectOption } from '@/shared';
import { BaseChartWidget } from '@chart/BaseChart';
import { DropdownQuerySetting, DropdownVizSetting } from '@core/domain/Model';
import { TableResponse } from '@core/domain/Response/Query/TableResponse';
import { WidgetRenderer } from './WidgetRenderer';
import { BaseWidget } from '@/screens/DashboardDetail/components/WidgetContainer/BaseWidget';
import { DefaultDropDownFilter } from '@chart/WidgetRenderer/DefaultDropDownFilter';

@Component
/**
 * @deprecated
 */
export default class DropdownFilter extends BaseChartWidget<TableResponse, DropdownVizSetting, DropdownQuerySetting> {
  protected renderer: WidgetRenderer<BaseWidget> = new DefaultDropDownFilter();
  static readonly ALL_ID = -1;

  static readonly DISPLAY_INDEX = 0;
  static readonly VALUE_INDEX = 1;

  @Prop({ default: -1 })
  id!: string | number;

  @Prop({ type: String, default: '' })
  subTitle!: string;

  @Prop({ type: String, default: '' })
  title!: string;

  @Prop()
  textColor?: string;

  @Prop()
  backgroundColor?: string;

  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;

  @Prop({ required: true, type: Object })
  setting!: DropdownVizSetting;

  @Prop({ type: Boolean, default: false })
  showEditComponent!: boolean;

  get colorStyle() {
    return {
      '--background-color': this.backgroundColor || '#333645',
      '--text-color': this.textColor || '#FFFFFF'
    };
  }

  @Prop({ required: true, type: Object })
  data!: TableResponse;

  @Prop({ required: true, type: Object })
  query!: DropdownQuerySetting;

  currentValue = '';

  get dropdownOptions(): SelectOption[] {
    if (this.data) {
      const haveLabelColumn: boolean = this.data.headers.length == 2;
      const valueIndex = haveLabelColumn ? DropdownFilter.VALUE_INDEX : DropdownFilter.DISPLAY_INDEX;
      const options = this.data.records.map((row, index) => {
        return {
          displayName: row[DropdownFilter.DISPLAY_INDEX],
          id: index,
          data: row[valueIndex]
        };
      });
      return [this.defaultOption, ...options];
    } else {
      return [this.defaultOption];
    }
  }

  private get defaultOption(): SelectOption {
    return {
      data: DropdownFilter.ALL_ID,
      id: DropdownFilter.ALL_ID,
      displayName: 'Show all'
    };
  }

  get valueProps(): string {
    return 'data';
  }

  get labelProps(): string {
    return 'displayName';
  }

  // Inject from ChartContainer.vue
  @Inject({ default: undefined })
  private onAddFilter?: (values: SelectOption) => void;

  // Inject from ChartContainer.vue
  @Inject({ default: undefined })
  private onRemoveFilter?: () => void;

  // Inject from FilterContainer.vue
  @Inject({ default: undefined })
  private readonly defaultValue?: any;

  handleFilterChanged(data: SelectOption) {
    this.currentValue = data.data;
    const selectAll = +this.currentValue == DropdownFilter.ALL_ID;
    if (selectAll && this.onRemoveFilter) {
      this.onRemoveFilter();
    } else if (this.onAddFilter) {
      this.onAddFilter(data);
    }
  }

  @Watch('dropdownOptions', { immediate: true })
  onDropdownOptionsChanged() {
    return (this.currentValue = this.defaultValue || this.dropdownOptions[0].data);
  }

  isHorizontalZoomIn(): boolean {
    return false;
  }

  isHorizontalZoomOut(): boolean {
    return false;
  }

  resize(): void {
    //Todo: Add resize method
  }

  get filterClass(): string {
    return this.showEditComponent ? 'disable' : '';
  }
}
// </script>
//
// <style lang="scss" scoped>
// ::v-deep {
//   .relative > span > button {
//     background-color: var(--background-color);
//
//     span {
//       color: var(--text-color);
//     }
//   }
//
//   .ic-16 {
//     margin-right: 0;
//   }
// }
// </style>
