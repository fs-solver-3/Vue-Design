/*
 * @author: tvc12 - Thien Vi
 * @created: 1/4/21, 11:37 AM
 */

import { Component, Prop, Ref, Watch } from 'vue-property-decorator';
import NProgress from 'nprogress';
import { BPagination } from 'bootstrap-vue';
import { DefaultPaging, DefaultSettingColor, TableSettingClass, TableSettingColor } from '@/shared/enums';
import { AbstractTableQuerySetting, HorizontalGridSetting, PivotTableVizData, TableVizData, TableVizSetting, VerticalGridSetting } from '@core/domain/Model';
import { ClassProfiler } from '@/shared/profiler/annotation';
import { HeaderData, Pagination } from '@/shared/models';
import { GroupTableResponse } from '@core/domain/Response/Query/GroupTableResponse';
import { AbstractTableResponse } from '@core/domain/Response/Query/AbstractTableResponse';
import PaginationComponent from '@chart/Table/Pagination.vue';
import { BaseWidget } from '@/screens/DashboardDetail/components/WidgetContainer/BaseWidget';
import '../table.style.scss';
import { DefaultTableRenderer } from '@chart/Table/DefaultTable/Render/DefaultTableRenderer';
import { CustomTableRenderer } from '@chart/Table/DefaultTable/Render/CustomTableRenderer';
import { WidgetRenderer } from '@chart/WidgetRenderer';
import { DashboardControllerModule } from '@/screens/DashboardDetail/stores/controller/DataControllerStore';
import { RenderController } from '@chart/custom/RenderController';
import { DI } from '@core/modules';
import { PageRenderService } from '@chart/custom/PageRenderService';
import { RenderProcessService } from '@chart/custom/RenderProcessService';
import CustomTable from '@chart/CustomTable/CustomTable.vue';
import { CustomBodyCellData, CustomHeaderCellData, CustomStyleData, CustomTableProp } from '@chart/CustomTable/TableData';
import { Scrollable } from '@core/domain/Model/Query/Features/Scrollable';
import { TableBodyStyleRender } from '@chart/Table/StyleRender/TableBodyStyleRender';
import TableHeader from '@chart/Table/TableHeader.vue';
import { ObjectUtils } from '@core/utils/ObjectUtils';
import { StringUtils } from '@/utils/string.utils';
import { TableHeaderStyleRender } from '@chart/Table/StyleRender/TableHeaderStyleRender';
import { TableFooterStyleRender } from '@chart/Table/StyleRender/TableFooterStyleRender';
import { DefaultTableBodyStyleRender2 } from '@chart/Table/DefaultTable/Style/Body/DefaultTableBodyStyleRender2';
import { DefaultTableHeaderStyleRender } from '@chart/Table/DefaultTable/Style/Header/DefaultTableHeaderStyleRender';
import { DefaultTableFooterStyleRender } from '@chart/Table/DefaultTable/Style/Footer/DefaultTableFooterStyleRender';
import { TableStyleUtils } from '@chart/Table/TableStyleUtils';
import { ThemeModule } from '@/store/modules/theme.store';
import { MouseEventData } from '@chart/BaseChart';
import { DashboardEvents } from '@/screens/DashboardDetail/enums/DashboardEvents';
import { TableTooltipUtils } from '@chart/CustomTable/TableTooltipUtils';
import { Log } from '@core/utils';

@Component({
  components: {
    PaginationComponent,
    CustomTable,
    TableHeader
  }
})
@ClassProfiler({ prefix: 'TableChart' })
export default class DefaultTable extends BaseWidget {
  private readonly pagination: Pagination;
  private internalTableResponse: AbstractTableResponse;
  private isSmallContainer: boolean;
  private isShowEntries: boolean;
  renderController: RenderController<any>;
  protected renderer: WidgetRenderer<DefaultTable> = new DefaultTableRenderer();
  private bodyStyleRender!: TableBodyStyleRender;
  private headerStyleRender!: TableHeaderStyleRender;
  private footerStyleRender!: TableFooterStyleRender;

  @Prop({ required: true })
  private readonly querySetting!: AbstractTableQuerySetting;

  @Prop({ required: true })
  private chartData!: AbstractTableResponse;

  @Prop({ type: Boolean, default: false })
  private isPreview?: boolean;

  @Prop({ type: Number, default: 1 })
  tableChartTempId!: number;

  @Ref()
  private readonly tableContent?: HTMLElement;

  private maxHeight: number | null = null;

  @Ref()
  private readonly refPaginationComponent!: PaginationComponent;

  private get refPagination(): BPagination {
    return this.refPaginationComponent.refPagination;
  }

  @Ref()
  private divTableChart!: HTMLElement;

  @Ref('table')
  private table?: CustomTable;

  get containerId(): string {
    return this.renderController.containerId;
  }

  constructor() {
    super();
    NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });
    this.internalTableResponse = GroupTableResponse.empty();
    this.isShowEntries = true;
    this.isSmallContainer = false;
    this.pagination = new Pagination({ page: 1, rowsPerPage: this.defaultRowsPerPage });
    this.renderController = this.createRenderController();
  }

  private createRenderController(): RenderController<any> {
    const pageRenderService = DI.get(PageRenderService);
    const processRenderService = DI.get(RenderProcessService);
    return new RenderController(pageRenderService, processRenderService);
  }

  private get vizSetting(): TableVizSetting | null {
    return this.querySetting.getVisualizationSetting() ?? null;
  }

  private get chartId() {
    return this.tableChartTempId;
  }

  get title(): string {
    return this.vizSetting?.getTitle() ?? '';
  }

  get subTitle(): string {
    return this.vizSetting?.getSubtitle() ?? '';
  }

  private get backgroundColor() {
    return this.vizSetting?.getBackgroundColor() || '#00000000';
  }

  private get textColor() {
    return this.vizSetting?.getTextColor() || '#FFFFFFCC';
  }

  ///Title Style

  get titleStyle() {
    const options = this.vizSetting?.options ?? {};
    const titleStyle = {
      [`--${TableSettingColor.textColor}`]: this.vizSetting?.getTitleColor(),
      'font-size': this.vizSetting?.getTitleFontSize(),
      'text-align': this.vizSetting?.getTitleAlign(),
      'font-family': options.title?.style?.fontFamily,
      'background-color': options.title?.backgroundColor,
      'white-space': options.title?.isWordWrap ? 'pre-wrap' : 'nowrap'
    };
    return ObjectUtils.removeKeyIfValueNotExist(titleStyle);
  }

  get titleAlign() {
    return this.vizSetting?.getTitleAlign();
  }

  ///Subtitle Style

  get subtitleStyle() {
    const options = this.vizSetting?.options ?? {};
    const subtitleStyle = {
      [`--${TableSettingColor.textColor}`]: this.vizSetting?.getSubtitleColor(),
      'font-size': this.vizSetting?.getSubtitleFontSize(),
      'text-align': this.vizSetting?.getSubtitleAlign(),
      'font-family': options.subtitle?.style?.fontFamily,
      'background-color': options.subtitle?.backgroundColor,
      'white-space': options.subtitle?.isWordWrap ? 'pre-wrap' : 'nowrap'
    };
    return ObjectUtils.removeKeyIfValueNotExist(subtitleStyle);
  }

  get subtitleAlign() {
    return this.vizSetting?.getSubtitleAlign();
  }

  get tableStyle() {
    return {
      '--background-color': this.backgroundColor,
      '--text-color': this.textColor,
      ...this.getTableSettingStyle(this.vizSetting)
    };
  }

  get tableChartContainerClass(): any {
    if (this.backgroundColor) {
      return `${TableSettingClass.tableChartContainer}`;
    } else {
      return `${TableSettingClass.tableChartContainer} ${TableSettingColor.secondaryBackgroundColor}`;
    }
  }

  private get perPageBackgroundColor() {
    if (!this.backgroundColor) {
      return DefaultSettingColor.defaultBackgroundColor;
    }
    return this.backgroundColor;
  }

  private get totalRows() {
    return this.internalTableResponse.total;
  }

  private get defaultRowsPerPage() {
    return DefaultPaging.defaultForDashboardDetail;
  }

  get nprocessParentId() {
    return `table-chart-${this.chartId}`;
  }

  private get headers(): HeaderData[] {
    return this.internalTableResponse.headers;
  }

  private get rows(): any[][] {
    return this.internalTableResponse.records;
  }

  mounted() {
    this.renderer = this.getTableRenderer();
    this.initStyleRender();
    this.$nextTick(() => {
      this.onResize();
    });
  }

  private getTableRenderer(): WidgetRenderer<DefaultTable> {
    return new DefaultTableRenderer();
  }

  resize(): void {
    this.onResize();
  }

  beforeDestroy() {
    this.renderController.dispose();
  }

  @Watch('chartData', { immediate: true, deep: true })
  private onChartDataChanged(newResponse: AbstractTableResponse) {
    this.internalTableResponse = newResponse;
  }

  @Watch('internalTableResponse', { immediate: true, deep: true })
  handleInternalTableResponseChanged() {
    this.initStyleRender();
    this.initEngine();
    // this.table?.reRender();
  }

  @Watch('vizSetting', { immediate: true, deep: true })
  onChartSettingChanged() {
    this.initStyleRender();
    this.initEngine();
    this.$nextTick(() => {
      this.table?.reRender();
    });
  }

  private initEngine() {
    if (this.vizSetting?.options?.isCustomDisplay) {
      this.renderer = new CustomTableRenderer();
      this.$nextTick(() => {
        this.renderController.processAndRender(
          {
            html: this.vizSetting?.options.html ?? '',
            css: this.vizSetting?.options.css ?? '',
            js: this.vizSetting?.options.js ?? ''
          },
          {
            options: this.vizSetting?.options ?? {},
            data: this.internalTableResponse
          }
        );
      });
    } else {
      this.renderer = this.getTableRenderer();
    }
  }

  async onPageChanged(page: number) {
    NProgress.configure({ parent: `#${this.nprocessParentId}` }).start();
    this.pagination.page = page;
    this.internalTableResponse = await this.handlePagingAction();
    this.handleResponsiveForPagingControl();
    NProgress.configure({ parent: `#${this.nprocessParentId}` }).done();
  }

  async handleSortChanged(label: string) {
    NProgress.configure({ parent: `#${this.nprocessParentId}` }).start();
    this.pagination.updateSort(label);
    this.internalTableResponse = await this.handlePagingAction();
    NProgress.configure({ parent: `#${this.nprocessParentId}` }).done();
  }

  async perPageChanged(value: number) {
    NProgress.configure({ parent: `#${this.nprocessParentId}` }).start();
    this.pagination.rowsPerPage = value;
    this.pagination.page = 1;
    this.internalTableResponse = await this.handlePagingAction();
    NProgress.configure({ parent: `#${this.nprocessParentId}` }).done();
  }

  private async handlePagingAction(): Promise<AbstractTableResponse> {
    const payload = { widgetId: this.chartId, pagination: this.pagination };
    return DashboardControllerModule.loadDataWithPagination(payload).then(data => data as AbstractTableResponse);
  }

  private onResize() {
    this.updateTableSize();
    this.handleResponsiveForPagingControl();
    this.initEngine();
  }

  private handleResponsiveForPagingControl() {
    if (this.divTableChart) {
      if (this.refPagination) {
        this.showAllPagingControl();
        if (this.divTableChart.clientWidth <= 400) {
          this.hidePagingNumberAndFirstLastControl();
          this.isShowEntries = false;
        }
        if (this.divTableChart.clientWidth <= 200) {
          this.isSmallContainer = true;
          this.isShowEntries = false;
        }
      } else {
        if (this.divTableChart.clientWidth > 200) {
          this.isSmallContainer = false;
          this.isShowEntries = false;
        }
      }
    }
  }

  private showAllPagingControl() {
    this.isShowEntries = true;
    for (let index = 0; index < this.refPagination.$el.children.length; index++) {
      // @ts-ignore
      this.refPagination.$el.children[index].hidden = false;
    }
  }

  private hidePagingNumberAndFirstLastControl() {
    let showItem = 5;
    if (this.refPagination.$el.children.length === 5) {
      showItem = 3;
    }
    if (this.refPagination.$el.children.length === 6) {
      showItem = 4;
    }
    for (let index = 0; index < this.refPagination.$el.children.length; index++) {
      const element = this.refPagination.$el.children[index];
      if (index !== 1 && index !== showItem && !element.classList.contains('active')) {
        // @ts-ignore
        element.hidden = true;
      }
    }
  }

  private updateTableSize() {
    this.maxHeight = this.tableContent?.clientHeight ?? 300;
  }

  get tableProps(): CustomTableProp {
    return {
      id: this.chartId,
      maxHeight: this.maxHeight,
      rows: this.rows,
      headers: this.headers,
      isShowFooter: this.isShowFooter,
      enableScrollBar: this.enableScrollBar,
      hasPinned: this.hasPinned,
      customCellCallBack: {
        // Avoid hosting in javascript
        customBodyCellStyle: this.customBodyCellStyle,
        customHeaderCellStyle: this.customHeaderCellStyle,
        customFooterCellStyle: this.customFooterCellStyle,
        onContextMenu: this.showContextMenu
      }
    };
  }

  private get hasPinned(): boolean {
    return false;
  }

  private get enableScrollBar(): boolean {
    if (this.vizSetting && Scrollable.isScrollable(this.vizSetting)) {
      return this.vizSetting.enableScrollBar();
    } else {
      return false;
    }
  }

  private get isShowFooter(): boolean {
    return false;
  }

  get paginationProps(): any {
    return {
      isShowEntries: this.isShowEntries,
      pagination: this.pagination,
      perPageBackgroundColor: this.perPageBackgroundColor,
      totalRows: this.totalRows,
      enable: this.enablePagination
    };
  }

  private customBodyCellStyle(data: CustomBodyCellData): CustomStyleData {
    return this.bodyStyleRender.createStyle(data);
  }

  get enablePagination(): boolean {
    const isNotLoadAll = this.internalTableResponse.total !== this.internalTableResponse.records.length;
    return isNotLoadAll || this.internalTableResponse.total > 20;
  }

  get headerProps() {
    const currentSetting: PivotTableVizData = this.vizSetting?.options ?? {};
    return {
      enableTitle: currentSetting.title?.enabled ?? true,
      enableSubtitle: currentSetting.subtitle?.enabled ?? true,
      title: this.title,
      subTitle: this.subTitle,
      titleAlign: this.titleAlign,
      subtitleAlign: this.subtitleAlign,
      titleStyle: this.titleStyle,
      subtitleStyle: this.subtitleStyle
    };
  }

  private getTableSettingStyle(setting?: TableVizSetting | null) {
    const currentSetting: TableVizData = setting?.options ?? {};
    const widgetColor: string | undefined = currentSetting.background;
    const baseThemeColor: string = this.getBaseThemeColor();
    const cssObject = {
      '--header-color': currentSetting.header?.style?.color,
      '--header-background-color': TableStyleUtils.combineColor(baseThemeColor, currentSetting.header?.backgroundColor, widgetColor),
      '--header-font-family': currentSetting.header?.style?.fontFamily,
      '--header-font-size': StringUtils.toPx(currentSetting.header?.style?.fontSize),
      '--header-white-space': currentSetting.header?.isWordWrap ? 'pre-wrap' : void 0,
      '--header-text-align': currentSetting.header?.align,
      // row
      '--row-even-color': currentSetting.value?.color,
      '--row-even-background-color': currentSetting.value?.backgroundColor,
      '--row-odd-color': currentSetting.value?.alternateColor,
      '--row-odd-background-color': currentSetting.value?.alternateBackgroundColor,
      '--row-font-family': currentSetting.value?.style?.fontFamily,
      '--row-font-size': StringUtils.toPx(currentSetting.value?.style?.fontSize),
      '--row-white-space': currentSetting.value?.style?.isWordWrap ? 'pre-wrap' : void 0,
      '--row-text-align': currentSetting.value?.align,
      //grid
      ...TableStyleUtils.getGridStyle(currentSetting.grid),
      '--grid-horizontal-padding': StringUtils.toPx(currentSetting.grid?.horizontal?.rowPadding),
      // tooltip
      '--tooltip-background-color': currentSetting.tooltip?.backgroundColor,
      '--tooltip-color': currentSetting.tooltip?.valueColor,
      '--tooltip-font-family': currentSetting.tooltip?.fontFamily,
      // toggle icon
      '--toggle-icon-background-color': currentSetting.toggleIcon?.backgroundColor,
      '--toggle-icon-color': currentSetting.toggleIcon?.color
    };
    return ObjectUtils.removeKeyIfValueNotExist(cssObject);
  }

  private initStyleRender() {
    this.bodyStyleRender = new DefaultTableBodyStyleRender2(this.internalTableResponse, this.querySetting, this.getBaseThemeColor());
    this.headerStyleRender = new DefaultTableHeaderStyleRender(this.internalTableResponse, this.querySetting);
    this.footerStyleRender = new DefaultTableFooterStyleRender(this.internalTableResponse, this.querySetting, this.getBaseThemeColor());
  }

  private customHeaderCellStyle(cellData: CustomHeaderCellData) {
    return this.headerStyleRender.createStyle(cellData);
  }

  private customFooterCellStyle(cellData: CustomHeaderCellData) {
    return this.footerStyleRender.createStyle(cellData);
  }

  private getBaseThemeColor(): string {
    return ThemeModule.baseDashboardTheme;
  }

  private showContextMenu(mouseData: MouseEventData<string>): void {
    TableTooltipUtils.hideTooltip();
    Log.debug('table::showContextMenu', mouseData);
    this.$root.$emit(DashboardEvents.ClickDataPoint, this.chartId, mouseData);
  }
}
