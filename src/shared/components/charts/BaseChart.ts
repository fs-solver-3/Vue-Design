import { ClassProfiler, MethodProfiler } from '@/shared/profiler/annotation';
import { VisualizationResponse } from '@core/domain/Response/Query/VisualizationResponse';
import { VizSetting } from '@core/domain/Model';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { BaseWidget } from '@/screens/DashboardDetail/components/WidgetContainer/BaseWidget';
import Highcharts, { Point } from 'highcharts';
import { HighchartRenderer } from '@chart/WidgetRenderer/HighchartRenderer';
import { WidgetRenderer } from '@chart/WidgetRenderer';
import { CustomHighchartRenderer } from '@chart/WidgetRenderer/CustomHighchartRenderer';
import { RenderController } from '@chart/custom/RenderController';

export class MouseEventData<T> {
  constructor(readonly event: MouseEvent, readonly data: T, readonly extraData: any = {}) {}
}

export const createPlotOptionsWithRightClickListener = (onRightClick: (data: MouseEventData<Point>) => void): any => {
  return {
    // allowPointSelect: true,
    cursor: 'pointer',
    point: {
      events: {
        contextmenu: function(event: MouseEvent) {
          const data: MouseEventData<Point> = new MouseEventData<Point>(event, (this as any) as Point);
          onRightClick(data);
        }
      }
    }
  };
};

@ClassProfiler({ prefix: 'BaseChart' })
export abstract class BaseChartWidget<Response extends VisualizationResponse, Setting extends VizSetting, Query extends QuerySetting> extends BaseWidget {
  abstract id: string | number;
  abstract title: string;
  abstract subTitle: string;
  abstract backgroundColor?: string;
  abstract textColor?: string;

  abstract data: Response;
  abstract setting: Setting;
  abstract isPreview: boolean;
  abstract query: Query;

  get colorStyle() {
    return {
      '--background-color': this.backgroundColor
    };
  }

  // fixme: function is not correct
  get chartClass() {
    if (this.backgroundColor) {
      if (this.isPreview) {
        return 'h-100 w-100 m-0 p-0 highcharts-container';
      } else {
        return 'h-100 w-100 m-0 p-0 highcharts-container';
      }
    }
    return 'h-100 w-100 m-0 p-0 secondary-chart-background-color highcharts-container';
  }
}

export abstract class BaseHighChartWidget<
  Response extends VisualizationResponse,
  Setting extends VizSetting,
  Query extends QuerySetting
> extends BaseChartWidget<Response, Setting, Query> {
  readonly highcharts = Highcharts;
  options!: any;
  protected renderer: WidgetRenderer<BaseWidget> = new HighchartRenderer();
  // protected abstract customRenderController: CustomRenderController<Response>;

  protected abstract renderController: RenderController<Response>;

  get containerId(): string {
    return this.renderController.containerId;
  }

  resize(): void {
    if (this.isCustomDisplay()) {
      this.resizeCustomChart();
    } else {
      this.resizeHighchart();
    }
  }

  protected isCustomDisplay(): boolean {
    return this.setting?.options.isCustomDisplay ?? false;
  }

  protected handleSwitchRenderer() {
    if (this.isCustomDisplay()) {
      if (this.renderer instanceof HighchartRenderer) {
        this.renderer = new CustomHighchartRenderer();
      }
    } else {
      if (this.renderer instanceof CustomHighchartRenderer) {
        this.renderer = new HighchartRenderer();
      }
    }
  }

  protected abstract buildHighchart(): void;

  protected abstract resizeHighchart(): void;

  protected resizeCustomChart(): void {
    this.buildCustomChart();
  }

  protected buildCustomChart(): void {
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

  @MethodProfiler({ name: 'reRenderChart' })
  protected reRenderChart() {
    this.handleSwitchRenderer();
    this.$nextTick(() => {
      if (this.isCustomDisplay()) {
        this.buildCustomChart();
      } else {
        this.buildHighchart();
      }
    });
  }
}
