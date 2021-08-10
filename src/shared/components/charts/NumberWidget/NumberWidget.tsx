import { Component, Prop, Watch } from 'vue-property-decorator';
import { DIException } from '@core/domain/Exception';
import { ClassProfiler, MethodProfiler } from '@/shared/profiler/annotation';
import { BaseChartWidget, MouseEventData } from '@chart/BaseChart';
import { SeriesOneResponse } from '@core/domain/Response';
import { NumberQuerySetting, NumberVizData, NumberVizSetting } from '@core/domain/Model';
import { ThemeModule } from '@/store/modules/theme.store';
import { CompareMode } from '@core/domain/Request/Query/CompareMode';
import { NumberConstants, NumberWidgetConfig } from '@/shared';
import { CustomNumberRenderer, WidgetRenderer } from '@chart/WidgetRenderer';
import { BaseWidget } from '@/screens/DashboardDetail/components/WidgetContainer/BaseWidget';
import { DefaultNumberRenderer } from '@chart/WidgetRenderer/DefaultNumberRenderer';
import './number-widget.scss';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { NumberFormatter, RangeData } from '@core/services/formatter';
import { HighchartUtils, MetricNumberMode } from '@/utils';
import { Log } from '@core/utils';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';

@Component
@ClassProfiler({ prefix: 'KPIWidget' })
export default class NumberWidget extends BaseChartWidget<SeriesOneResponse, NumberVizSetting, NumberQuerySetting> {
  private numberFormatter!: NumberFormatter;

  @Prop({ required: true, type: Object })
  data!: SeriesOneResponse;

  @Prop({ required: true, type: Object })
  setting!: NumberVizSetting;

  @Prop({ default: -1 })
  id!: string | number;

  @Prop({ type: String, default: '' })
  subTitle!: string;

  @Prop({ type: String, default: '' })
  title!: string;

  @Prop({ type: String })
  textColor?: string;

  @Prop({ type: String })
  backgroundColor?: string;

  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;

  @Prop({ required: true })
  query!: NumberQuerySetting;

  protected renderer: WidgetRenderer<BaseWidget> = new DefaultNumberRenderer();

  private widgetConfig: NumberWidgetConfig = NumberConstants.NUMBER_WIDGET_CONFIGS[0];

  protected renderController: RenderController<SeriesOneResponse>;

  get numberWidgetStyle() {
    return {
      '--background-color': this.backgroundColor,
      '--number-text-size': `${this.widgetConfig.numberTextSize}px`,
      '--title-text-size': `${this.widgetConfig.titleTextSize}px`,
      '--sub-title-text-size': `${this.widgetConfig.subTitleTextSize}px`,
      '--margin-subtitle': `${this.widgetConfig.marginConfig[0]}px`,
      '--margin-number': `${this.widgetConfig.marginConfig[1]}px`,
      '--margin-comparison': `${this.widgetConfig.marginConfig[2]}px`
    };
  }

  get compareStyle(): CSSStyleDeclaration {
    const color = this.isCompareDown ? ThemeModule.currentTheme.numberDecreaseColor : ThemeModule.currentTheme.numberIncreaseColor;
    return {
      color: color
    } as CSSStyleDeclaration;
  }

  @MethodProfiler({ prefix: 'NumberWidget' })
  get displayValue() {
    const formattedData = this.numberFormatter.format(this.value);
    return `${this.prefix}${formattedData}${this.postfix}`;
  }

  @MethodProfiler({ prefix: 'NumberWidget' })
  get formattedValue() {
    return this.numberFormatter.format(this.value);
  }

  get tooltipConfig(): any {
    const placement = this.setting.options.align ?? 'center';
    return {
      placement: placement
    };
  }

  get tooltipStyle(): any {
    const tooltip = this.setting.options.tooltip ?? {};
    return {
      background: tooltip.backgroundColor,
      color: tooltip.valueColor,
      'font-family': tooltip.fontFamily
    };
  }

  get widgetClass() {
    if (this.backgroundColor) {
      if (this.isPreview) {
        return 'number-widget-container';
      } else {
        return 'number-widget-container';
      }
    }
    return 'number-widget-container secondary-chart-background-color';
  }

  // Title Style
  get titleStyle() {
    const title = this.setting.options.title ?? {};
    return {
      '--text-color': title.style?.color,
      'font-size': title.style?.fontSize ?? '20px',
      'font-family': title.style?.fontFamily,
      'text-align': title.align ?? 'center',
      'white-space': 'nowrap',
      'text-overflow': 'ellipsis',
      overflow: 'hidden'
    };
  }

  // Subtitle Style
  get subtitleStyle() {
    const title = this.setting.options.subtitle ?? {};
    return {
      '--text-color': title.style?.color,
      'font-size': title.style?.fontSize ?? '20px',
      'font-family': title.style?.fontFamily,
      'text-align': title.align ?? 'center',
      'white-space': 'nowrap',
      'text-overflow': 'ellipsis',
      overflow: 'hidden'
    };
  }

  get headerProps() {
    const currentSetting: NumberVizData = this.setting?.options ?? {};
    return {
      enableTitle: currentSetting.title?.enabled ?? true,
      enableSubtitle: currentSetting.subtitle?.enabled ?? true,
      title: this.title,
      subTitle: this.subTitle,
      titleAlign: currentSetting.title?.align ?? 'center',
      subtitleAlign: currentSetting.subtitle?.align ?? 'center',
      titleStyle: this.titleStyle,
      subtitleStyle: this.subtitleStyle
    };
  }

  //Value

  get valueStyle() {
    const style = this.setting.options.style ?? {};
    return {
      'font-size': style.fontSize ?? '36px',
      'font-family': style.fontFamily,
      color: style.color
    };
  }

  //
  get valueBarStyle() {
    const align = this.setting.options.align ?? 'center';
    return {
      'text-align': align
    };
  }

  //Prefix

  get prefixStyle() {
    const style = this.setting.options.prefix?.style ?? {};
    return {
      'font-size': style.fontSize ?? '36px',
      'font-family': style.fontFamily,
      color: style.color
    };
  }

  //Postfix

  get postfixStyle() {
    const style = this.setting.options.postfix?.style ?? {};
    return {
      'font-size': style.fontSize ?? '36px',
      'font-family': style.fontFamily,
      color: style.color
    };
  }

  get compareValueFormat() {
    if (this.compareValue) {
      return Math.abs(this.compareValue).toFixed(2) + '%';
    }
    return '';
  }

  get isCompareDown() {
    return this.compareValue && this.compareValue < 0;
  }

  get compareValue(): number | undefined {
    if (this.data.compareResponses) {
      const response = this.data.compareResponses.get(CompareMode.percentageDifference);
      if (response) {
        return response.series[0].data[0];
      }
    }
    return void 0;
  }

  get prefix(): string {
    if (this.setting && this.setting.options) {
      return this.setting.options.prefix?.text || '';
    }
    return '';
  }

  get postfix(): string {
    if (this.setting && this.setting.options) {
      return this.setting.options.postfix?.text || '';
    }
    return '';
  }

  private get value(): number {
    return this.data.series[0].data[0];
  }

  created() {
    if (this.data.series.length !== 1 || this.data.series[0].data.length !== 1) {
      throw new DIException('Number Widget only support table with only one Aggregation config');
    }
  }

  mounted() {
    this.$nextTick(() => this.resize());
  }

  resize(): void {
    if (this.isCustomDisplay()) {
      //
    } else {
      this.handleResizeNumberWidget();
    }
  }

  isHorizontalZoomIn(): boolean {
    return false;
  }

  isHorizontalZoomOut(): boolean {
    return false;
  }

  private setDimensionConfig(config: NumberWidgetConfig) {
    this.widgetConfig = config;
  }

  get containerId(): string {
    return this.renderController.containerId;
  }

  private isCustomDisplay() {
    return this.setting?.options?.isCustomDisplay ?? false;
  }

  @Watch('setting', { immediate: true })
  onQuerySettingChanged() {
    this.handleSwitchRenderer();
    if (this.isCustomDisplay()) {
      this.$nextTick(() => {
        this.rebuildCustomNumberChart();
      });
    }
  }

  @Watch('setting.options.displayUnit')
  onNumberMetricChanged(newMetricNumberMode: MetricNumberMode) {
    const newMetricNumber: string[] | undefined = HighchartUtils.toMetricNumbers(newMetricNumberMode);
    const newRanges: RangeData[] | undefined = HighchartUtils.buildRangeData(newMetricNumber);
    this.numberFormatter.setRanges(newRanges);
  }

  protected handleSwitchRenderer() {
    if (this.isCustomDisplay()) {
      if (this.renderer instanceof DefaultNumberRenderer) {
        this.renderer = new CustomNumberRenderer();
      }
    } else {
      if (this.renderer instanceof CustomNumberRenderer) {
        this.renderer = new DefaultNumberRenderer();
      }
    }
  }

  private handleResizeNumberWidget() {
    Log.info('height-width', this.$el.clientWidth);
    let isAlreadySetSize = false;
    for (let i = 0; i < NumberConstants.NUMBER_WIDGET_CONFIGS.length; ++i) {
      const config = NumberConstants.NUMBER_WIDGET_CONFIGS[i];
      if (this.$el.clientWidth > config.minWidth && this.$el.clientWidth <= config.maxWidth) {
        this.setDimensionConfig(config);
        isAlreadySetSize = true;
        break;
      }
    }
    if (!isAlreadySetSize) {
      this.setDimensionConfig(NumberConstants.NUMBER_WIDGET_CONFIGS[0]);
    }
  }

  @Watch('data')
  onChartDataChanged() {
    this.rebuildCustomNumberChart();
  }

  private rebuildCustomNumberChart() {
    if (this.isCustomDisplay()) {
      this.renderController.processAndRender(
        {
          html: this.setting.options.html ?? '',
          css: this.setting.options.css ?? '',
          js: this.setting.options.js ?? ''
        },
        {
          data: this.data,
          options: this.setting.options
        }
      );
    }
  }

  beforeDestroy() {
    this.renderController.dispose();
  }

  constructor() {
    super();
    this.renderController = this.createRenderController();
    this.numberFormatter = this.buildFormatterByMetricNumber(this.setting.options.displayUnit ?? MetricNumberMode.Default);
  }

  private buildFormatterByMetricNumber(metricNumber: MetricNumberMode) {
    const metricNumbers = HighchartUtils.toMetricNumbers(metricNumber);
    const ranges: RangeData[] | undefined = HighchartUtils.buildRangeData(metricNumbers);
    return new NumberFormatter(ranges);
  }

  private createRenderController(): RenderController<SeriesOneResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
  }

  handleShowContextMenu(event: MouseEvent): void {
    event.preventDefault();
    const mouseEventDataAString = new MouseEventData<string>(event, this.value?.toString());
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.id, mouseEventDataAString);
  }
}
