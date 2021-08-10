import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import { Direction, SelectOption, TabFilterDisplay, TableSettingColor } from '@/shared';
import { BaseChartWidget } from '@chart/BaseChart';
import { TabFilterQuerySetting, TabFilterVizSetting } from '@core/domain/Model';
import { TableResponse } from '@core/domain/Response/Query/TableResponse';
import { WidgetRenderer } from './WidgetRenderer';
import { BaseWidget } from '@/screens/DashboardDetail/components/WidgetContainer/BaseWidget';
import { DefaultTabFilter } from '@chart/WidgetRenderer/DefaultTabFilter';
import { IdGenerator } from '@/utils/id_generator';
import '@/shared/components/charts/Table/table.style.scss';
import './tab-filter.scss';

@Component
export default class TabFilter extends BaseChartWidget<TableResponse, TabFilterVizSetting, TabFilterQuerySetting> {
  static readonly componentsWithDisplay: Map<TabFilterDisplay, string> = new Map<TabFilterDisplay, string>([
    [TabFilterDisplay.normal, 'NormalTabItem'],
    [TabFilterDisplay.multiChoice, 'MultiChoiceItem'],
    [TabFilterDisplay.singleChoice, 'SingleChoiceItem']
  ]);
  static readonly OPTION_SHOW_ALL = {
    displayName: 'Shown All',
    id: -1,
    data: ''
  };

  protected renderer: WidgetRenderer<BaseWidget> = new DefaultTabFilter();

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
  setting!: TabFilterVizSetting;

  @Prop({ type: Boolean, default: false })
  showEditComponent!: boolean;

  @Prop({ required: true, type: Object })
  data!: TableResponse;

  @Prop({ required: true, type: Object })
  query!: TabFilterQuerySetting;

  // Inject from ChartContainer.vue
  @Inject({ default: undefined })
  private onAddMultiFilter?: (filters: SelectOption[]) => void;

  get direction(): Direction {
    return this.setting.options.direction ?? Direction.row;
  }

  get displayAs(): TabFilterDisplay {
    return this.setting.options.displayAs ?? TabFilterDisplay.normal;
  }

  get colorStyle() {
    return {
      '--background-color': this.backgroundColor || '#333645',
      '--text-color': this.textColor || '#FFFFFF'
    };
  }

  get containerStyle() {
    const alignKey = this.direction == Direction.column ? 'justify-content' : 'align-self';
    return {
      '--background-color': this.backgroundColor,
      '--text-color': this.textColor,
      [alignKey]: this.setting.options.align ?? 'center',
      '--active-background-color': this.setting.options.activeColor,
      '--deactivate-background-color': this.setting.options.deactivateColor
    };
  }

  get selectionStyle() {
    return {
      '--background-color': this.backgroundColor,
      '--text-color': this.textColor
    };
  }

  get titleStyle() {
    return {
      [`--${TableSettingColor.textColor}`]: this.setting.getTitleColor()
    };
  }

  get selectOptions(): SelectOption[] {
    if (this.data) {
      const haveLabelColumn: boolean = this.data.headers.length == 2;
      const valueIndex = haveLabelColumn ? TabFilter.VALUE_INDEX : TabFilter.DISPLAY_INDEX;
      const options = this.data.records.map((row, index) => {
        return {
          displayName: row[TabFilter.DISPLAY_INDEX],
          id: index,
          data: row[valueIndex]
        };
      });

      return [TabFilter.OPTION_SHOW_ALL, ...options];
    } else {
      return [];
    }
  }

  private get directionClass(): string {
    switch (this.direction) {
      case Direction.row:
        return 'flex-row tab-display-row';
      case Direction.column:
        return 'flex-column h-100 overflow-auto';
    }
  }

  get containerClass(): any {
    if (this.isPreview) {
      if (this.backgroundColor) {
        return `tab-filter-container ${this.directionClass}`;
      } else {
        return `tab-filter-container ${this.directionClass} ${TableSettingColor.secondaryBackgroundColor}`;
      }
    }
    return `tab-filter-container ${this.directionClass}`;
  }

  get infoClass(): string {
    switch (this.direction) {
      case Direction.row:
        return 'horizon-tab-filter-info';
      case Direction.column:
        return 'vert-tab-filter-info';
    }
  }

  get filterClass(): string {
    let margin = '';
    if (this.direction == Direction.column) {
      margin = 'mt-3';
    } else {
      margin = 'ml-2';
    }
    return this.showEditComponent ? `disable ml-1 ${margin}` : `ml-1 ${margin}`;
  }

  handleFilterChanged(optionsSelected: SelectOption[]) {
    if (this.onAddMultiFilter) {
      this.onAddMultiFilter(optionsSelected);
    }
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

  @Watch('setting', { immediate: true, deep: true })
  onChartSettingChanged() {
    this.updateChartData();
  }

  private updateChartData() {
    this.renderer = new DefaultTabFilter();
  }

  get tabSelectionData(): any {
    return {
      selectOptions: this.selectOptions,
      id: IdGenerator.generateMultiSelectionId('tab-filter', +this.id),
      displayAs: this.displayAs,
      direction: this.direction,
      appendAtRoot: true
    };
  }
}
