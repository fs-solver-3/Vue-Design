import {
  ColumnType,
  DatabaseSchema,
  Field,
  FieldRelatedFunction,
  FilterMode,
  FilterWidget,
  FunctionType,
  Group,
  OrderBy,
  TableColumn,
  TableSchema
} from '@core/domain/Model';
import {
  AggregationFunctionTypes,
  ConditionData,
  ConditionFamilyTypes,
  ConditionTreeNode,
  DataBuilderConstants,
  DateFunctionTypes,
  DateHistogramConditionTypes,
  FilterConstants,
  FunctionData,
  FunctionFamilyTypes,
  FunctionTreeNode,
  GeospatialConditionTypes,
  GeospatialFunctionTypes,
  InputType,
  NumberConditionTypes,
  SettingItemType,
  SortTypes,
  StringConditionTypes,
  WidgetType
} from '@/shared';
import { SlTreeNodeModel } from '@/shared/components/builder/treemenu/SlVueTree';
import { ListUtils } from '@/utils/list.utils';
import { FilterRequest, SortDirection } from '@core/domain/Request';
import { FunctionResolver } from '@core/services/function_builder/function_resolver';
import { DI } from '@core/modules';
import { TabItem } from '@/shared/models';
import { SchemaUtils } from '@/utils/schema.utils';
import { CustomJsAsMap, DefaultJs } from '@/shared/constants/custom-chart.js';
import { CustomHtmlAsMap, DefaultHtml } from '@/shared/constants/custom-chart.html';
import { CustomCssAsMap, DefaultCss } from '@/shared/constants/custom-chart.css';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';
import { Log, NumberUtils } from '@core/utils';
import { DisplayTableType } from '@core/domain/Model/VizSetting/Implement/TableVizSetting';
import { MinMaxData } from '@core/domain/Response/Query/AbstractTableResponse';

export abstract class ChartUtils {
  private static SETTING_NEED_KEEPS = ['title', 'subtitle', 'background', 'text_color'];

  static isColumnNumber(tableColumn: TableColumn): boolean {
    return ChartUtils.isNumberType(tableColumn.function.field.fieldType);
  }

  static isNumberType(type: string): boolean {
    switch (type.toLowerCase()) {
      case ColumnType.int8:
      case ColumnType.int16:
      case ColumnType.int32:
      case ColumnType.int64:
      case ColumnType.uint8:
      case ColumnType.uint16:
      case ColumnType.uint32:
      case ColumnType.uint64:
      case ColumnType.float:
      case ColumnType.float64:
      case ColumnType.double:
        return true;
      default:
        return false;
    }
  }

  static isDateType(type: string): boolean {
    switch (type.toLowerCase()) {
      case ColumnType.date:
      case ColumnType.datetime:
      case ColumnType.datetime64:
        return true;
      default:
        return false;
    }
  }

  static isTextType(type: string): boolean {
    switch (type.toLowerCase()) {
      case ColumnType.string:
        return true;
      default:
        return false;
    }
  }

  static getFilterType(familyType: string): string {
    // TODO: be-careful if nodeName change, function will return wrong value
    switch (familyType) {
      case ConditionFamilyTypes.dateHistogram:
        return DateHistogramConditionTypes.earlierThan;
      case ConditionFamilyTypes.number:
        return NumberConditionTypes.equal;
      case ConditionFamilyTypes.string:
        return StringConditionTypes.equal;
      case ConditionFamilyTypes.geospatial:
        return GeospatialConditionTypes.countryOf;
      default:
        return '';
    }
  }

  static getDefaultFilterByColumnType(type: string): string {
    switch (type) {
      case ColumnType.int8:
      case ColumnType.int16:
      case ColumnType.int32:
      case ColumnType.int64:
      case ColumnType.uint8:
      case ColumnType.uint16:
      case ColumnType.uint32:
      case ColumnType.uint64:
      case ColumnType.float:
      case ColumnType.double:
        return ConditionFamilyTypes.number;
      case ColumnType.string:
        return ConditionFamilyTypes.string;
      case ColumnType.date:
      case ColumnType.datetime:
      case ColumnType.datetime64:
        return ConditionFamilyTypes.dateHistogram;
      default:
        return ConditionFamilyTypes.dateHistogram;
    }
  }

  static buildNameOfFilter(filterType: string, firstValue: string, secondValue: string): string {
    switch (filterType) {
      case DateHistogramConditionTypes.between:
      case DateHistogramConditionTypes.betweenAndIncluding:
        return `${filterType} ${firstValue} and ${secondValue}`;
      case DateHistogramConditionTypes.lastNDays:
      case DateHistogramConditionTypes.lastNHours:
      case DateHistogramConditionTypes.lastNMinutes:
      case DateHistogramConditionTypes.lastNMonths:
      case DateHistogramConditionTypes.lastNWeeks:
      case DateHistogramConditionTypes.lastNYears: {
        const regex = new RegExp('\\s+N\\s+');
        return filterType.replace(regex, ` ${firstValue} `);
      }
      case DateHistogramConditionTypes.currentYear:
      case DateHistogramConditionTypes.currentWeek:
      case DateHistogramConditionTypes.currentQuarter:
      case DateHistogramConditionTypes.currentMonth:
      case DateHistogramConditionTypes.currentDay:
      case StringConditionTypes.isnull:
      case StringConditionTypes.notNull:
        return filterType;
      default:
        return `${filterType} ${firstValue}`;
    }
  }

  static getColumnType(node: ConditionTreeNode): string | undefined {
    if (node.field) {
      return node.field.fieldType;
    } else {
      const index = node.ind;
      const table = node.parent.tag as TableSchema;
      if (table) {
        return table.columns[index].className;
      }
    }
    return void 0;
  }

  static getField(node: ConditionTreeNode | FunctionTreeNode): Field | undefined {
    if (node.field) {
      return node.field;
    } else {
      const path = Array.from(node.path);
      if (path.length === 2) {
        const index = node.ind;
        if (node.parent.children) {
          return node.parent.children[index].tag as Field;
        }
      } else {
        return this.getFieldNested(node, path);
      }
    }
  }

  static isDisplayColumn(functionFamily: string | undefined) {
    return functionFamily === FunctionFamilyTypes.groupBy || functionFamily === FunctionFamilyTypes.dateHistogram;
  }

  static toFilterRequests(filters: FilterWidget[]) {
    return filters.map(filter => filter.toFilterRequest()).filter((filter): filter is FilterRequest => filter instanceof FilterRequest);
  }

  static mergeConfig(currentNode: FunctionTreeNode, newNode: FunctionTreeNode): FunctionTreeNode {
    // return undefined;
    return {
      ...newNode,
      functionFamily: currentNode.functionFamily,
      functionType: currentNode.functionType,
      id: currentNode.id,
      displayAsColumn: currentNode.displayAsColumn
    };
  }

  static mergeCondition(currentNode: ConditionTreeNode, newNode: ConditionTreeNode): ConditionTreeNode {
    return {
      ...newNode,
      id: currentNode.id,
      groupId: currentNode.groupId,
      filterCondition: this.buildNameOfFilter(currentNode.filterType, currentNode.firstValue, currentNode.secondValue),
      firstValue: currentNode.firstValue,
      secondValue: currentNode.secondValue,
      filterFamily: currentNode.filterFamily,
      filterType: currentNode.filterType,
      parent: {
        ...newNode.parent
      },
      title: newNode.title
    };
  }

  static getDefaultFnType(functionFamily: string): string {
    switch (functionFamily) {
      case FunctionFamilyTypes.dateHistogram:
        return DateFunctionTypes.year;
      case FunctionFamilyTypes.geospatial:
        return GeospatialFunctionTypes.cityOf;
      case FunctionFamilyTypes.aggregation:
        return AggregationFunctionTypes.sum;
      default:
        return '';
    }
  }

  static buildTableColumnsFromFunctionData(listFunctionData: FunctionData[]): TableColumn[] {
    const functionBuilder: FunctionResolver = DI.get(FunctionResolver);
    return listFunctionData.map(data => {
      const func = functionBuilder.buildFunction(data) as FieldRelatedFunction;
      return new TableColumn(data.name, func, data.displayAsColumn || false, false, true);
    });
  }

  static buildOrderFunction(func: FieldRelatedFunction, sorting: string, isShowNElements?: boolean, numElemsShown?: number | null): OrderBy | undefined {
    const nElements: number | undefined | null = isShowNElements ? numElemsShown : void 0;
    switch (sorting) {
      case SortTypes.AscendingOrder:
        return new OrderBy(func, SortDirection.Asc, nElements);
      case SortTypes.DescendingOrder:
        return new OrderBy(func, SortDirection.Desc, nElements);
      default:
        return void 0;
    }
  }

  static getTabItems(vizSetting: any, chartType: WidgetType): TabItem[] {
    return vizSetting.tabs.map((tab: any) => {
      const tabItem = TabItem.fromObject(tab);
      return this.injectDefaultValue(tabItem, chartType);
    });
  }

  static isNoneComponent(type: string): boolean {
    return type == SettingItemType.none;
  }

  static isGroupSettingComponent(type: string): boolean {
    return type == SettingItemType.group;
  }

  static isDifferentFieldType(firstField: Field | undefined, secondField: Field) {
    if (firstField && secondField) {
      if (ChartUtils.isNumberType(firstField.fieldType) && ChartUtils.isNumberType(secondField.fieldType)) {
        return false;
      } else if (ChartUtils.isDateType(firstField.fieldType) && ChartUtils.isDateType(secondField.fieldType)) {
        return false;
      } else if (ChartUtils.isTextType(firstField.fieldType) && ChartUtils.isTextType(secondField.fieldType)) {
        return false;
      }
    }
    return true;
  }

  static getProfileFieldsFromDBSchemaTblName(dbSchema: DatabaseSchema, tblName: string): FieldDetailInfo[] {
    const selectedTable = dbSchema.tables.find(table => table.name === tblName);
    if (selectedTable) {
      return selectedTable.columns.map(
        column =>
          new FieldDetailInfo(
            new Field(selectedTable.dbName, selectedTable.name, column.name, column.className),
            column.name,
            column.displayName,
            SchemaUtils.isNested(selectedTable.name),
            false
          )
      );
    }
    return [];
  }

  static getDisplayTableType(tabItems: TabItem[]): DisplayTableType | undefined {
    const displayTypeKey = 'display_type';
    return tabItems[0]?.getItem(displayTypeKey)?.value;
  }

  static getBinsNumber(tabItems: TabItem[]): string | undefined {
    const binsNumberKey = 'bins_number';
    return tabItems[0]?.getItem(binsNumberKey)?.value;
  }

  static getArea(tabItems: TabItem[]): string | undefined {
    const areaKey = 'area_select';
    return tabItems[3]?.getItem(areaKey)?.value;
  }

  static isAreaDifferent(tabItems: TabItem[], currentValue: string) {
    const newValue = this.getArea(tabItems);
    return this.isValueDifferent(currentValue, newValue);
  }

  static getFilterFamily(node: ConditionTreeNode): string {
    const columnType = ChartUtils.getColumnType(node);

    if (columnType) {
      return ChartUtils.getDefaultFilterByColumnType(columnType);
    } else {
      return DataBuilderConstants.FILTER_NODES[0].label;
    }
  }

  static toConditionData(node: ConditionTreeNode): ConditionData {
    const field = ChartUtils.getField(node) as Field;
    return {
      id: node.id,
      groupId: node.groupId,
      familyType: node.filterFamily,
      subType: node.filterType,
      firstValue: node.firstValue,
      secondValue: node.secondValue,
      field: field,
      tableName: node.parent.title,
      columnName: node.title,
      isNested: node.isNested || node?.path?.length > 2 || false,
      allValues: node.allValues,
      filterModeSelected: node.filterModeSelected ?? FilterMode.range,
      currentOptionSelected: node.currentOptionSelected ?? FilterConstants.DEFAULT_SELECTED,
      currentInputType: node.currentInputType ?? FilterConstants.DEFAULT_STRING_SELECTED
    };
  }

  static resetNodeData(newNode: ConditionTreeNode) {
    newNode.allValues = [];
    newNode.secondValue = '';
    newNode.firstValue = '';
    if (newNode.field) {
      newNode.filterFamily = ChartUtils.getFilterFamily(newNode);
      if (ChartUtils.isDateType(newNode.field.fieldType)) {
        newNode.filterType = newNode.currentOptionSelected = newNode.filterType = FilterConstants.DEFAULT_DATE_SELECTED;
        newNode.filterModeSelected = FilterMode.range;
        newNode.currentInputType = InputType.dateRange;
      } else if (ChartUtils.isTextType(newNode.field.fieldType)) {
        newNode.filterType = newNode.currentOptionSelected = newNode.filterType = FilterConstants.DEFAULT_STRING_SELECTED;
        newNode.filterModeSelected = FilterMode.selection;
        newNode.currentInputType = InputType.multiSelect;
      } else if (ChartUtils.isNumberType(newNode.field.fieldType)) {
        newNode.filterType = newNode.currentOptionSelected = newNode.filterType = FilterConstants.DEFAULT_NUMBER_SELECTED;
        newNode.filterModeSelected = FilterMode.range;
        newNode.currentInputType = InputType.text;
      }
    }
  }

  static getDefaultJs(chartType: WidgetType) {
    return CustomJsAsMap.get(chartType) ?? DefaultJs;
  }

  static getDefaultHtml(chartType: WidgetType) {
    return CustomHtmlAsMap.get(chartType) ?? DefaultHtml;
  }

  static getDefaultCss(chartType: WidgetType) {
    return CustomCssAsMap.get(chartType) ?? DefaultCss;
  }

  static isMobile() {
    return document.body.clientWidth < 800;
  }

  static isDesktop() {
    return !this.isMobile();
  }

  static keepSettings(newTabItems: TabItem[], oldTabItems: TabItem[]) {
    const newTabItem = newTabItems[0];
    const oldTabItem = oldTabItems[0];
    if (newTabItem && oldTabItem) {
      this.SETTING_NEED_KEEPS.forEach(key => {
        const newItem = newTabItem.getItem(key);
        const oldItem = oldTabItem.getItem(key);
        if (oldItem && newItem) {
          newItem.value = oldItem.value;
        }
      });
    }
    return newTabItems;
  }

  static isAggregationFunction(fieldRelatedFunction: FieldRelatedFunction) {
    const [family, type] = fieldRelatedFunction.getFunctionTypes();
    return family == FunctionFamilyTypes.aggregation;
  }

  static findTableColumnIsNumber(columns: TableColumn[]): TableColumn[] {
    return columns.filter(column => ChartUtils.isNumberType(column.function.field.fieldType) || ChartUtils.isAggregationFunction(column.function));
  }

  private static isValueDifferent(oldValue: string, newValue: string | undefined): boolean {
    return !!(newValue && newValue !== oldValue);
  }

  private static getFieldNested(node: ConditionTreeNode | FunctionTreeNode, path: number[]): Field | undefined {
    const firstIndex = path.shift();
    const tailNode = this.getTailNodeInNestedColumn(node.parent, path);
    if (tailNode) {
      Log.debug('getField::tailNode', tailNode);
      return tailNode.tag as Field;
    } else {
      return void 0;
    }
  }

  private static getTailNodeInNestedColumn(node: SlTreeNodeModel<any>, indexes: number[]): SlTreeNodeModel<any> | undefined {
    if (ListUtils.isEmpty(indexes)) {
      return node;
    } else {
      const nextIndex = indexes.shift();
      if (node.children) {
        return this.getTailNodeInNestedColumn(node.children[nextIndex!], indexes);
      } else {
        return void 0;
      }
    }
  }

  private static injectDefaultValue(tabItem: TabItem, chartType: WidgetType) {
    switch (tabItem.key) {
      case 'html':
        {
          const html = tabItem.getItem('html');
          if (html) {
            html.value = this.getDefaultHtml(chartType);
          }
        }
        break;
      case 'js':
        {
          const js = tabItem.getItem('javascript');
          if (js) {
            js.value = this.getDefaultJs(chartType);
          }
        }
        break;
      case 'css': {
        const css = tabItem.getItem('css');
        if (css) {
          css.value = this.getDefaultCss(chartType);
        }
      }
    }
    return tabItem;
  }

  static calculateRatio(value: number, minMaxData: MinMaxData): number {
    if (minMaxData.max === minMaxData.min) {
      return 1;
    } else {
      const ratio = (value - minMaxData.min) / (minMaxData.max - minMaxData.min);
      return NumberUtils.limit(ratio, 0, 1);
    }
  }

  static hasOnlyNoneFunction(columns: TableColumn[]): boolean {
    return !columns.some(column => column.function.className !== FunctionType.Select && column.function.className !== FunctionType.SelectDistinct);
  }

  static isGroupByFunction(relatedFunction: FieldRelatedFunction): relatedFunction is Group {
    return relatedFunction.className === FunctionType.Group;
  }
}
