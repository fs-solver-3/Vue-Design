import {
  BellCurve2VizSetting,
  BellCurveVizSetting,
  BubbleVizSetting,
  ChartFamilyType,
  DrilldownPieVizSetting,
  DrilldownVizSetting,
  DropdownVizSetting,
  FunnelVizSetting,
  GaugeVizSetting,
  HeatMapVizSetting,
  HistogramVizSetting,
  MapChartVizSetting,
  NumberVizSetting,
  ParetoVizSetting,
  ParliamentVizSetting,
  PieVizSetting,
  PivotTableVizSetting,
  PyramidVizSetting,
  ScatterVizSetting,
  SeriesVizSetting,
  SpiderWebVizSetting,
  StackedVizSetting,
  TabFilterVizSetting,
  TableVizSetting,
  TreeMapVizSetting,
  VizSettingType,
  WordCloudVizSetting
} from '@core/domain/Model';
import { DarkTheme } from '@/themes/theme';
import { DIException } from '@core/domain/Exception';
import { WidgetType } from '@/shared';
import { isString } from 'lodash';
import { VizSettingData } from '@core/domain/Model/VizSetting/ExtraSetting/VizSettingData';
import { JsonUtils } from '@core/utils';
import { ThemeModule } from '@/store/modules/theme.store';

export abstract class VizSetting<T extends VizSettingData = VizSettingData> {
  static readonly CHART_TYPE_CONVERT: Map<string, string> = new Map<string, string>([
    [WidgetType.bubble, 'bubble'],
    [WidgetType.pareto, WidgetType.column],
    [WidgetType.bellCurve, WidgetType.scatter],
    [WidgetType.gauges, 'solidgauge'],
    [WidgetType.columnDrillDown, WidgetType.column],
    [WidgetType.barDrillDown, WidgetType.bar],
    [WidgetType.pieDrillDown, WidgetType.pie],
    [WidgetType.area, WidgetType.areaSpline],
    [WidgetType.stackedLine, WidgetType.line],
    [WidgetType.stackedColumn, WidgetType.column],
    [WidgetType.stackedBar, WidgetType.bar],
    [WidgetType.histogram, WidgetType.column],
    [WidgetType.parliament, 'item'],
    [WidgetType.spiderWeb, 'line'],
    [WidgetType.heatMap, WidgetType.heatMap]
  ]);
  static readonly CONFIG = {
    themeColor: { enabled: true },
    // colors: ['#04C0C7', '#5144D3', '#E7871A', '#DA338F', '#9089FA', '#47E26F', '#2780EA', '#6F38B1', '#DEBF03', '#CB6F0F', '#278C6C'],
    chart: {
      backgroundColor: DarkTheme.transparent,
      style: {
        fontFamily: 'Barlow'
      }
    },
    boost: {
      useGPUTranslations: true,
      usePreAllocated: true
    },
    legend: {
      backgroundColor: DarkTheme.transparent
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: false
        }
      },
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      },
      scatter: {
        marker: {
          radius: 5,
          states: {
            hover: {
              enabled: true,
              lineColor: 'rgb(100,100,100)'
            }
          }
        },
        states: {
          hover: {
            marker: {
              enabled: false
            }
          }
        },
        solidgauge: {
          dataLabels: {
            y: 5,
            borderWidth: 0,
            useHTML: true
          }
        }
      },
      treemap: {
        borderColor: 'var(--secondary)',
        borderWidth: 0.5,
        dataLabels: {
          enabled: true,
          style: {
            textOutline: 0
          }
        }
      }
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    }
  };
  static readonly DRILL_DOWN_CONFIG = {
    drillUpButton: {
      position: {
        align: 'right'
      },
      theme: {
        fill: 'var(--transparent)',
        'stroke-width': 0.5,
        stroke: 'var(--primary)',
        r: 0,
        states: {
          hover: {
            fill: 'var(--primary)'
          },
          select: {
            stroke: 'var(--primary)',
            fill: 'var(--primary)'
          }
        }
      }
    },
    activeAxisLabelStyle: {
      color: 'var(--text-color)'
    }
  };
  static readonly DEFAULT_PALETTE_COLOR = [
    // '#04C0C7',
    // '#5144D3',
    // '#E7871A',
    // '#DA338F',
    // '#9089FA',
    // '#47E26F',
    // '#2780EA',
    // '#6F38B1',
    // '#DEBF03',
    // '#CB6F0F',
    // '#278C6C'
    '#2b908f',
    '#90ee7e',
    '#f45b5b',
    '#7798BF',
    '#aaeeee',
    '#ff0066',
    '#eeaaee',
    '#55BF3B',
    '#DF5353',
    '#7798BF',
    '#aaeeee'
  ];
  abstract readonly className: VizSettingType;
  abstract readonly chartFamilyType: ChartFamilyType;

  protected constructor(public readonly options: T) {}

  static fromObject(obj: VizSetting): VizSetting {
    switch (obj.className) {
      case VizSettingType.BellCurveSetting:
        return BellCurveVizSetting.fromObject(obj as BellCurveVizSetting);
      case VizSettingType.SeriesSetting:
        return SeriesVizSetting.fromObject(obj as SeriesVizSetting);
      case VizSettingType.PieSetting:
        return PieVizSetting.fromObject(obj as PieVizSetting);
      case VizSettingType.FunnelSetting:
        return FunnelVizSetting.fromObject(obj as FunnelVizSetting);
      case VizSettingType.PyramidSetting:
        return PyramidVizSetting.fromObject(obj as PyramidVizSetting);
      case VizSettingType.ScatterSetting:
        return ScatterVizSetting.fromObject(obj as ScatterVizSetting);
      case VizSettingType.BubbleSetting:
        return BubbleVizSetting.fromObject(obj as BubbleVizSetting);
      case VizSettingType.ParetoSetting:
        return ParetoVizSetting.fromObject(obj as ParetoVizSetting);
      case VizSettingType.HeatMapSetting:
        return HeatMapVizSetting.fromObject(obj as HeatMapVizSetting);
      case VizSettingType.GaugeSetting:
        return GaugeVizSetting.fromObject(obj as GaugeVizSetting);
      case VizSettingType.NumberSetting:
        return NumberVizSetting.fromObject(obj as NumberVizSetting);
      case VizSettingType.DrilldownSetting:
        return DrilldownVizSetting.fromObject(obj as DrilldownVizSetting);
      case VizSettingType.DrilldownPieSetting:
        return DrilldownPieVizSetting.fromObject(obj as DrilldownPieVizSetting);
      case VizSettingType.TableSetting:
        return TableVizSetting.fromObject(obj);
      case VizSettingType.WordCloudSetting:
        return WordCloudVizSetting.fromObject(obj as WordCloudVizSetting);
      case VizSettingType.TreeMapSetting:
        return TreeMapVizSetting.fromObject(obj as TreeMapVizSetting);
      case VizSettingType.StackedSeriesSetting:
        return StackedVizSetting.fromObject(obj as StackedVizSetting);
      case VizSettingType.HistogramSetting:
        return HistogramVizSetting.fromObject(obj as HistogramVizSetting);
      case VizSettingType.DropdownSetting:
        return DropdownVizSetting.fromObject(obj as DropdownVizSetting);
      case VizSettingType.MapSetting:
        return MapChartVizSetting.fromObject(obj as MapChartVizSetting);
      case VizSettingType.TabFilterSetting:
        return TabFilterVizSetting.fromObject(obj as TabFilterVizSetting);
      case VizSettingType.PivotTableSetting:
        return PivotTableVizSetting.fromObject(obj);
      case VizSettingType.ParliamentSetting:
        return ParliamentVizSetting.fromObject(obj);
      case VizSettingType.SpiderWebSetting:
        return SpiderWebVizSetting.fromObject(obj as SpiderWebVizSetting);
      case VizSettingType.BellCurve2Setting:
        return BellCurve2VizSetting.fromObject(obj as BellCurve2VizSetting);
      default:
        throw new DIException(`ChartSetting:: ${obj.className} unsupported`);
    }
  }

  getBackgroundColor(): string {
    return this.options?.background ?? '#00000019';
  }

  getSubtitle(): string {
    if (isString(this.options?.subtitle)) {
      return this.options.subtitle;
    }
    return this.options?.subtitle?.text ?? '';
  }

  getSubtitleColor() {
    const defaultColor = '#fff';
    if (isString(this.options?.subtitle)) {
      return this.getTextColor() || defaultColor;
    }
    return this.options?.subtitle?.style?.color ?? defaultColor;
  }

  getSubtitleFontSize(): string {
    const defaultFontSize = '12px';
    if (isString(this.options?.subtitle)) {
      return defaultFontSize;
    }
    return this.options?.subtitle?.style?.fontSize ?? defaultFontSize;
  }

  getSubtitleAlign(): string {
    const defaultAlign = 'center';
    if (isString(this.options?.subtitle)) {
      return defaultAlign;
    }
    return this.options?.subtitle?.align ?? defaultAlign;
  }

  getTextColor(): string {
    return this.options?.textColor ?? '#fff';
  }

  getTitle(): string {
    if (isString(this.options?.title)) {
      return this.options.title;
    }
    return this.options?.title?.text ?? '';
  }

  setTitle(title: string): void {
    if (isString(this.options.title)) {
      Object.assign(this.options, { title: title });
    } else {
      JsonUtils.mergeDeep(this.options, {
        title: {
          text: title
        }
      });
    }
  }

  getTitleColor() {
    const defaultColor = '#fff';
    if (isString(this.options?.title)) {
      return this.getTextColor() || defaultColor;
    }
    return this.options?.title?.style?.color ?? defaultColor;
  }

  getTitleFontSize(): string {
    const defaultFontSize = '20px';
    if (isString(this.options?.title)) {
      return defaultFontSize;
    }
    return this.options?.title?.style?.fontSize ?? defaultFontSize;
  }

  getTitleAlign(): string {
    const defaultAlign = 'center';
    if (isString(this.options?.title)) {
      return defaultAlign;
    }
    return this.options.title?.align ?? defaultAlign;
  }

  isAffectedByFilter(): boolean {
    return this.options?.affectedByFilter ?? true;
  }

  isEnableDrilldown(): boolean {
    return this.options?.isEnableDrilldown ?? false;
  }

  isEnableZoom(): boolean {
    return this.options?.isEnableZoom ?? false;
  }

  get colors(): string[] {
    if (this.options.themeColor?.enabled ?? true) {
      return ThemeModule.paletteColor;
    }
    return this.options.themeColor?.colors ?? [];
  }
}
