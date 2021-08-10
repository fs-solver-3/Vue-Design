import { Component, Emit, Prop, PropSync, Vue } from 'vue-property-decorator';
import { FormatDateTime, ListUtils, RandomUtils } from '@/utils';
import { FilterConstants, InputType } from '@/shared';
import { ThemeModule } from '@/store/modules/theme.store';
import Color from 'color';
import NumberFilter from '@/shared/components/filters/NumberFilter.vue';
import { DynamicFilter } from '@core/domain/Model';
import DateHistogramFilter from '@/shared/components/filters/DateHistogramFilter.vue';
import SelectionFilter from '@/shared/components/filters/SelectionFilter.vue';
import ChipButton from '@/shared/components/ChipButton.vue';
import ChipListing, { ChipData } from '@/shared/components/ChipListing.vue';
import DynamicFilterPopover from '@/shared/components/filters/DynamicFilterPanel/DynamicFilterPopover.vue';
import { DynamicFilterPopoverData } from '@/shared/components/filters/DynamicFilterPanel/DynamicFilterPopover';

@Component({
  components: {
    ChipListing,
    ChipButton,
    NumberFilter,
    DateHistogramFilter,
    SelectionFilter,
    DynamicFilterPopover
  }
})
export default class DynamicFilterPanel extends Vue {
  private isShowPopover = false;
  private displayFilterType: string = FilterConstants.DEFAULT_SELECTED;

  @PropSync('filter', { required: true, type: DynamicFilter })
  private dynamicFilter!: DynamicFilter;

  @Prop({ required: false, type: String, default: 'bottom' })
  private placement!: string;

  @Prop({ required: false, type: Boolean, default: true })
  private isShowDisable!: boolean;

  @Prop({ type: Number, default: 3 })
  private maxChipShowing!: number;

  @Prop()
  id!: string;

  get currentValues(): string[] {
    return this.dynamicFilter.currentValues ?? [];
  }

  set currentValues(newValue: string[]) {
    this.dynamicFilter.currentValues = newValue ?? [];
  }

  private get isEnable(): boolean {
    return this.dynamicFilter.isEnable ?? true;
  }

  private set isEnable(newValue: boolean) {
    this.dynamicFilter.isEnable = newValue;
  }

  get btnId() {
    // return `btn-filter-${RandomUtils.nextInt()}`;
    return this.id;
  }

  private get filterName(): string {
    return this.dynamicFilter.name;
  }

  private get isDisable(): boolean {
    return !this.isEnable;
  }

  private get currentInputType(): InputType {
    return this.dynamicFilter.currentInputType ?? InputType.text;
  }

  private set currentInputType(newInputType: InputType) {
    this.dynamicFilter.currentInputType = newInputType;
  }

  private get isShowTagListing(): boolean {
    switch (this.currentInputType) {
      case InputType.none:
        return true;
      default:
        return ListUtils.isNotEmpty(this.currentValues);
    }
  }

  private get viewPanelStyle(): CSSStyleDeclaration {
    if (this.isShowDisable) {
      const secondaryColor: Color = Color(ThemeModule.currentTheme.secondary);
      const alpha: number = this.getAlpha(this.isEnable);
      return {
        background: secondaryColor.alpha(alpha).toString()
      } as CSSStyleDeclaration;
    } else {
      return {} as any;
    }
  }

  private get currentOptionSelected(): string {
    return this.dynamicFilter.currentOptionSelected || FilterConstants.DEFAULT_SELECTED;
  }

  private set currentOptionSelected(newValue: string) {
    this.dynamicFilter.currentOptionSelected = newValue ?? '';
  }

  private get listChipData(): ChipData[] {
    switch (this.currentInputType) {
      case InputType.none:
        return [
          {
            title: this.currentOptionSelected,
            isShowRemove: true
          }
        ];
      case InputType.date:
        return this.currentValues.map(value => {
          return {
            title: FormatDateTime.formatDateDisplay(this.currentValues[0]),
            isShowRemove: true
          };
        });
      case InputType.dateRange:
        return [
          {
            title: `${FormatDateTime.formatDateDisplay(this.currentValues[0])} - ${FormatDateTime.formatDateDisplay(this.currentValues[1])}`,
            isShowRemove: true
          }
        ];
      case InputType.text:
        return [
          {
            title: this.currentValues[0],
            isShowRemove: true
          }
        ];
      default:
        return this.currentValues.map(value => {
          return {
            title: value,
            isShowRemove: true
          };
        });
    }
  }

  mounted() {
    this.displayFilterType = this.getDisplayFilterType(this.currentValues, this.currentOptionSelected, this.currentInputType);
  }

  @Emit('onRemove')
  private handleDeleteFilter() {
    // this.hidePopover();
  }

  @Emit('onApplyFilter')
  private handleApplyFilter(filterPopoverData: DynamicFilterPopoverData) {
    this.currentValues = filterPopoverData.currentValues;
    this.currentInputType = filterPopoverData.currentInputType;
    this.currentOptionSelected = filterPopoverData.currentOptionSelected;
    this.dynamicFilter.filterModeSelected = filterPopoverData.currentFilterMode;
    this.displayFilterType = this.getDisplayFilterType(this.currentValues, this.currentOptionSelected, this.currentInputType);
  }

  private getDisplayFilterType(currentValues: string[], currentOptionSelected: string, currentInputType: InputType): string {
    switch (currentInputType) {
      case InputType.none:
        return FilterConstants.DEFAULT_SELECTED;
      default:
        return this.currentOptionSelected;
    }
  }

  showPopover(): void {
    this.isShowPopover = true;
  }

  private getAlpha(isEnable: boolean): number {
    if (isEnable) {
      return ThemeModule.currentTheme.enableAlpha;
    } else {
      return ThemeModule.currentTheme.disableAlpha;
    }
  }

  @Emit('onValuesChanged')
  private handleRemoveChipAt(index: number): void {
    switch (this.currentInputType) {
      case InputType.none:
        this.currentValues = [];
        this.currentInputType = InputType.text;
        this.currentOptionSelected = '';
        this.displayFilterType = FilterConstants.DEFAULT_SELECTED;
        break;
      case InputType.dateRange:
        this.currentValues = [];
        this.currentOptionSelected = '';
        this.displayFilterType = FilterConstants.DEFAULT_DATE_SELECTED;
        break;
      case InputType.text:
        this.currentValues = [];
        this.currentOptionSelected = '';
        this.displayFilterType = FilterConstants.DEFAULT_SELECTED;
        break;
      default:
        if (this.currentValues.length === 1 && index === 0) {
          this.currentValues.splice(-1, 1);
          this.displayFilterType = FilterConstants.DEFAULT_SELECTED;
          this.currentOptionSelected = '';
        } else {
          this.currentValues.splice(index, 1);
        }
    }
  }

  @Emit('onFilterStatusChanged')
  private toggleEnableFilter() {
    this.isEnable = !this.isEnable;
  }
}
