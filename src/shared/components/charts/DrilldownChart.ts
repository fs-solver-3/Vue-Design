import { merge } from 'lodash';
import Highcharts from 'highcharts';
import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import { DIException } from '@core/domain/Exception';
import { BaseHighChartWidget } from '@chart/BaseChart.ts';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { VizSettingData, DrilldownVizSetting, DrilldownQueryChartSetting, VizSetting } from '@core/domain/Model';
import { DrilldownResponse } from '@core/domain/Response/Query/DrilldownResponse';
import { HighchartUtils, MetricNumberMode } from '@/utils';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import { Log } from '@core/utils';

@Component
@ClassProfiler({ prefix: 'HighchartsDrilldownChart' })
export default class DrilldownChart extends BaseHighChartWidget<DrilldownResponse, DrilldownVizSetting, DrilldownQueryChartSetting> {
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
  @Prop({ required: true, type: Object })
  data!: DrilldownResponse;

  @Prop({ required: true, type: Object })
  setting!: DrilldownVizSetting;

  @Prop({ type: Boolean, default: false })
  isPreview!: boolean;
  @Prop({ required: true })
  query!: DrilldownQueryChartSetting;

  @Ref()
  chart: any;
  // todo: fixme return correct default type
  protected renderController: RenderController<DrilldownResponse>;

  constructor() {
    super();
    const manualOption = {
      chart: {
        type: 'column'
      },
      accessibility: {
        announceNewData: {
          enabled: true
        }
      },
      xAxis: {
        type: 'category'
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
      }
    };

    this.updateOptions(manualOption);
    this.renderController = this.createRenderController();
  }
  private createRenderController(): RenderController<DrilldownResponse> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
  }

  @Watch('title')
  onTitleChanged() {
    if (this.isCustomDisplay()) {
      this.buildCustomChart();
    } else {
      this.updateChartInfo();
    }
  }

  @Watch('subTitle')
  onSubtitleChanged() {
    if (this.isCustomDisplay()) {
      this.buildCustomChart();
    } else {
      this.updateChartInfo();
    }
  }

  @Watch('setting')
  onChartSettingChanged() {
    this.reRenderChart();
  }

  @Watch('data')
  onChartDataChanged() {
    this.reRenderChart();
  }

  @Watch('textColor')
  onTextColorChanged() {
    if (this.isCustomDisplay()) {
      this.buildCustomChart();
    } else {
      this.updateTextColor(this.textColor, true);
    }
  }

  mounted() {
    this.reRenderChart();
  }

  toDrilldown(chartData: DrilldownResponse): any {
    const colorSetting = {
      activeAxisLabelStyle: {
        color: this.textColor || 'var(--text-color)'
      },
      activeDataLabelStyle: {
        color: this.textColor || 'var(--text-color)'
      }
    };
    return merge(
      {},
      {
        series: chartData.drilldown
      },
      VizSetting.DRILL_DOWN_CONFIG,
      colorSetting
    );
  }

  updateOptions(newOptions: any) {
    this.options = merge({}, VizSetting.CONFIG, DrilldownVizSetting.DEFAULT_SETTING, this.options, newOptions);
  }

  isHorizontalZoomIn(): boolean {
    return false;
  }

  isHorizontalZoomOut(): boolean {
    return false;
  }

  beforeDestroy() {
    this.renderController.dispose();
  }

  protected getChart(): Highcharts.Chart | undefined {
    return this.chart?.getChart();
  }

  protected buildHighchart() {
    try {
      this.updateMetricNumber(this.setting.options);
      HighchartUtils.reset(this.getChart());
      this.load(this.data);
      this.updateChartInfo();
      HighchartUtils.updateChart(this.getChart(), this.setting.options);
      this.updateTextColor(this.textColor, false);
      HighchartUtils.drawChart(this.getChart());
    } catch (e) {
      if (e instanceof DIException) {
        throw e;
      } else {
        Log.error(`HighchartsDrilldownChart:: buildChart:: ${e}`);
        throw new DIException('Error when display chart. Please try again!');
      }
    }
  }

  protected load(chartData: DrilldownResponse) {
    const series = [
      {
        name: '',
        colorByPoint: true,
        data: chartData.series
      }
    ];
    HighchartUtils.addSeries(this.getChart(), series);
    const drillDown = this.toDrilldown(chartData);
    HighchartUtils.updateChart(this.getChart(), { drilldown: drillDown });
  }

  protected resizeHighchart(): void {
    this.getChart()?.reflow();
  }

  private updateTextColor(color: string | undefined, reDraw: boolean): void {
    if (color) {
      const newStyle = {
        color: color
      };
      const newColorOption = {
        legend: {
          itemStyle: newStyle
        },
        xAxis: {
          title: {
            style: newStyle
          },
          labels: {
            style: newStyle
          }
        },
        yAxis: {
          title: {
            style: newStyle
          },
          labels: {
            style: newStyle
          }
        }
      };
      HighchartUtils.updateChart(this.getChart(), newColorOption, reDraw);
    }
  }

  private updateChartInfo() {
    HighchartUtils.updateChartInfo(this.getChart(), { title: this.title, subTitle: this.subTitle });
  }

  private updateMetricNumber(options: VizSettingData) {
    const metrixNumber: string[] | undefined = HighchartUtils.toMetricNumbers(options.metricNumbers ?? MetricNumberMode.Default);
    Highcharts.setOptions({
      lang: {
        numericSymbols: metrixNumber
      }
    });
  }
}
