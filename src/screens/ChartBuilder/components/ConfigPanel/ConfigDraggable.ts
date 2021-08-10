import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import DropArea from '@/shared/components/DropArea.vue';
import { ConditionTreeNode, DataFlavor, DraggableConfig, FunctionData, FunctionNode, FunctionTreeNode, LabelNode } from '@/shared/interfaces';
import { ChartUtils, DomUtils, ListUtils, SchemaUtils } from '@/utils';
import { DatabaseSchema, Field } from '@core/domain/Model';
import { ConfigType, DataBuilderConstants, FunctionFamilyInfo, FunctionFamilyTypes, Status } from '@/shared';
import draggable from 'vuedraggable';
import { FunctionDataUtils, Log } from '@core/utils';
import { isArray } from 'highcharts';
import { isNumber } from 'lodash';
import VueContext from 'vue-context';
import ConfigModal from '@/screens/ChartBuilder/components/ConfigPanel/ConfigModal.vue';
import DropItem from '@/shared/components/DropItem.vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { DatabaseSchemaModule } from '@/store/modules/data_builder/database_schema.store';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import { ConfigDataUtils } from '@/screens/ChartBuilder/components/ConfigPanel/ConfigDataUtils';
import { Accept, CloneWhenDrop, Deny, DragCustomEvent, DropOptions, GroupConfig } from '@/screens/ChartBuilder/model/DragConfig';
import { FunctionNodeBuilder } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionBuilder/FunctionNodeBuilder';
import { FunctionFamilyBuilder } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionBuilder/FunctionFamilyBuilder';
import DraggableItem from '@/screens/ChartBuilder/components/ConfigPanel/DraggableItem.vue';
import { PopupUtils } from '@/utils/popup.utils';

export interface ContextData {
  data: { node: FunctionTreeNode; i: number };
}

@Component({
  components: {
    ConfigModal,
    DropArea,
    draggable,
    VueContext,
    DropItem,
    StatusWidget,
    DraggableItem
  }
})
export default class ConfigDraggable extends Vue {
  private readonly functions: FunctionNode[] = DataBuilderConstants.FUNCTION_NODES;
  private readonly sorts: LabelNode[] = DataBuilderConstants.SORTS_NODES;

  @Prop({ required: true })
  private config!: DraggableConfig;

  @Prop({ type: Boolean, default: false })
  private hasDragging!: boolean;

  @Prop({ type: Boolean, default: true })
  private showTitle!: boolean;

  @Prop({ type: Boolean, default: true })
  private showHelpIcon!: boolean;
  private currentFunctions: FunctionTreeNode[] = [];
  private selectedNode: FunctionTreeNode | null = null;
  private editingNode: FunctionTreeNode | null = null;
  private isModalOpen = false;
  private isItemDragging = false;
  private titleOfModal = '';
  private selectedDatabaseSchema: DatabaseSchema | null = null;
  private fieldContextStatus = Status.Loading;
  private errorMessage = '';
  private profileFields: FieldDetailInfo[] = [];
  @Ref()
  private fnFamilyContext!: any;
  @Ref()
  private fnTypeContext!: any;
  @Ref()
  private menu!: any;
  @Ref()
  private sortingContext!: any;
  @Ref()
  private fieldContext!: any;

  private get enableSorting(): boolean {
    return this.configType == ConfigType.sorting;
  }

  private get configType(): ConfigType {
    return this.config.key;
  }

  private get defaultFunctions(): FunctionData[] {
    return QueryBuilderStoreModule.configsAsMap.get(this.config.key) ?? [];
  }

  private get isShowPlaceHolder(): boolean {
    return this.canDrop;
  }

  private get subFunctionGroups(): any[] {
    const subFunctions = this.selectedNode?.functionFamily ? this.functions.find(func => func.label === this.selectedNode?.functionFamily)?.subFunctions : null;
    const options: any[] = [];
    if (subFunctions && Array.isArray(subFunctions)) {
      subFunctions.forEach(item => {
        options.push(item);
        if (item.type === 'group') {
          item.options?.forEach(option => options.push(option));
        }
      });
    }
    return options;
  }

  private get subFunctions(): FunctionNode[] | null {
    const _subFunctions = this.editingNode?.functionFamily ? this.functions.find(func => func.label === this.editingNode?.functionFamily)?.subFunctions : null;
    return _subFunctions && isArray(_subFunctions) ? _subFunctions : null;
  }

  private get canDrop(): boolean {
    if (isNumber(this.config.maxItem)) {
      return this.currentFunctions.length < this.config.maxItem!;
    } else {
      return true;
    }
  }

  private get canDraggable(): boolean {
    return ListUtils.isNotEmpty(this.currentFunctions);
  }

  // https://github.com/SortableJS/Sortable#event-object-demo
  private get groupConfig(): GroupConfig {
    return {
      name: this.config.key,
      put: this.handlePut,
      // ability to move from the list, clone/move/ or none
      pull: this.handlePull,
      revertClone: true
    };
  }

  private handlePut(toData: any, fromData: any): Accept | Deny {
    return this.canDrop ? DropOptions.Accept : DropOptions.Deny;
  }

  // return none/move/clone
  private handlePull(toData: any, fromData: any): Accept | Deny | CloneWhenDrop {
    if (this.isSameDropSection({ to: toData.el } as any)) {
      return DropOptions.Accept;
    } else {
      return DropOptions.CloneWhenDrop;
    }
  }

  @Watch('defaultFunctions', { immediate: true })
  private onDefaultConfigsChanged(listFunctionData: FunctionData[]) {
    this.currentFunctions = FunctionDataUtils.toFunctionTreeNodes(listFunctionData);
  }

  private async handleFunctionFamilyChanged(node: FunctionNode, context: ContextData): Promise<void> {
    const { i } = context.data;
    const functionNode: FunctionTreeNode = this.currentFunctions[i];
    functionNode.displayAsColumn = false;
    const field: Field = ChartUtils.getField(functionNode) as Field;
    const functionFamilyInfo = new FunctionFamilyBuilder()
      .withField(field)
      .withSelectedFunction(node.label as FunctionFamilyTypes)
      .build();

    Vue.set(functionNode, 'functionFamily', functionFamilyInfo.family);
    Vue.set(functionNode, 'functionType', functionFamilyInfo.type);

    QueryBuilderStoreModule.updateConfig({
      configType: this.configType,
      data: ConfigDataUtils.createFunctionData(functionNode)
    });
    await DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private async handleFunctionTypeChanged(node: FunctionNode, context: ContextData): Promise<void> {
    const { i } = context.data;
    const currentConfig: FunctionTreeNode = this.currentFunctions[i];
    currentConfig.functionType = node.label;

    QueryBuilderStoreModule.updateConfig({
      configType: this.configType,
      data: ConfigDataUtils.createFunctionData(context.data.node)
    });
    await DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private async handleSortingChanged(sort: LabelNode, contextData: ContextData): Promise<void> {
    const { i } = contextData.data;
    const currentConfig: FunctionTreeNode = this.currentFunctions[i];
    currentConfig.sorting = sort.label;
    QueryBuilderStoreModule.updateConfig({
      configType: this.configType,
      data: ConfigDataUtils.createFunctionData(contextData.data.node)
    });
    await DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private openContext(target: VueContext, event: Event, data: ContextData['data']): void {
    this.selectedNode = data.node;
    this.closeAllContext(target);
    target.open(event, data);
  }

  private closeAllContext(target: VueContext) {
    Object.values(this.$refs).map((ref: any) => {
      if (ref !== target && ref.close) {
        ref.close();
      }
    });
  }

  private async handleDrop(data: DataFlavor<FunctionTreeNode>): Promise<void> {
    if (data && data.node) {
      const newData: FunctionTreeNode = new FunctionNodeBuilder(data.node, this.config)
        .withRandomId()
        .withSortInfo(this.enableSorting)
        .build();
      this.currentFunctions.push(newData);
      const func: FunctionData = ConfigDataUtils.createFunctionData(newData);
      QueryBuilderStoreModule.addConfig({
        configType: this.configType,
        data: func
      });
      await DataBuilderModule.buildQueryAndRenderVizPanel();
    }
  }

  private async removeItem(index: number): Promise<void> {
    const config = this.currentFunctions[index];
    this.currentFunctions.splice(index, 1);
    QueryBuilderStoreModule.removeConfig({
      configType: this.configType,
      id: config.id
    });
    await DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private openModal(node: FunctionTreeNode): void {
    this.selectedNode = node;
    this.editingNode = JSON.parse(JSON.stringify(node));
    this.titleOfModal = node.displayName;
    this.isModalOpen = true;
    node.optionsOpened = false;
  }

  private closeOptions(): void {
    this.currentFunctions.map(config => {
      if (config.optionsOpened) {
        config.optionsOpened = false;
      }
    });
  }

  private isSameDropSection(event: DragCustomEvent): boolean {
    const dragConfig: DraggableConfig | undefined = ConfigDataUtils.getDraggableConfig(event.to);
    if (dragConfig) {
      return dragConfig.key == this.config.key;
    } else {
      return false;
    }
  }

  private isIndexChanged(data: { oldDraggableIndex: number; newDraggableIndex: number }): boolean {
    return data.oldDraggableIndex !== data.newDraggableIndex;
  }

  private async handleFunctionChanged(event: DragCustomEvent): Promise<void> {
    this.isItemDragging = false;
    this.emitItemDragging(false);
    if (this.isSameDropSection(event) && this.isIndexChanged(event)) {
      const listFunctionData = this.currentFunctions.map(config => ConfigDataUtils.createFunctionData(config));
      QueryBuilderStoreModule.changeIndex({
        configs: listFunctionData,
        configType: this.configType
      });
      await DataBuilderModule.buildQueryAndRenderVizPanel();
    }
  }

  private handleRemoveOldFunction(event: DragCustomEvent) {
    const canRemoveOldFunction = this.config.key != ConfigType.sorting;
    const fromConfig: DraggableConfig | undefined = ConfigDataUtils.getDraggableConfig(event.from);
    if (canRemoveOldFunction && fromConfig && fromConfig.key != ConfigType.sorting) {
      QueryBuilderStoreModule.removeFunctionAt({
        configType: fromConfig.key,
        index: event.oldDraggableIndex
      });
    }
  }

  private async handleDropFromOtherSection(event: DragCustomEvent): Promise<void> {
    if (ConfigDataUtils.isFromFilterSection(event)) {
      await this.dropFromFilterSection(event);
    } else {
      await this.dropFromFunctionSection(event);
    }
  }

  private async dropFromFilterSection(event: DragCustomEvent): Promise<void> {
    const { group, groupIndex } = ConfigDataUtils.getFilterGroupInfo(event.from);
    if (!!group && isNumber(groupIndex)) {
      const fromIndex = event.oldDraggableIndex;
      const toIndex = event.newDraggableIndex;
      const conditionNode: ConditionTreeNode = group[fromIndex];
      DomUtils.bind('conditionNode', conditionNode);
      const currentFunction: FunctionTreeNode = ConfigDataUtils.toFunctionNode(conditionNode, this.config, this.enableSorting);
      await this.handleInsertFunction([currentFunction, toIndex]);
    }
  }

  private async dropFromFunctionSection(event: DragCustomEvent): Promise<void> {
    const index = event.newDraggableIndex;
    const currentFunction: FunctionTreeNode = this.currentFunctions[index];
    // Remove current function at index
    // Because lib auto assign new function in to currentFunctions, before handleAdd called
    this.currentFunctions.splice(index, 1);
    this.handleRemoveOldFunction(event);
    await this.handleInsertFunction([currentFunction, index]);
  }

  private async handleInsertFunction(payload: [FunctionTreeNode, number]): Promise<void> {
    const [node, index] = payload;
    if (node) {
      const newData = new FunctionNodeBuilder(node, this.config)
        .withRandomId()
        .withSortInfo(this.enableSorting)
        .build();
      this.currentFunctions.splice(index, 0, newData);
      const data = ConfigDataUtils.createFunctionData(newData);
      QueryBuilderStoreModule.addConfig({
        data: data,
        configType: this.configType,
        index: index
      });
      await DataBuilderModule.buildQueryAndRenderVizPanel();
    }
  }

  private async handleReplaceFunction(payload: [FunctionTreeNode, number]) {
    const [node, index] = payload;
    if (node) {
      const configMerged = this.mergeConfig(node, index);
      if (configMerged.field && ChartUtils.isDifferentFieldType(this.currentFunctions[index].field, configMerged.field)) {
        this.setDefaultFunction(configMerged);
      }
      await this.updateConfig(configMerged, index);
    }
  }

  private async updateConfig(newConfig: FunctionTreeNode, index: number): Promise<void> {
    this.currentFunctions.splice(index, 1, newConfig);
    QueryBuilderStoreModule.updateConfig({
      data: ConfigDataUtils.createFunctionData(newConfig),
      configType: this.configType
    });
    await DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private mergeConfig(node: FunctionTreeNode, index: number) {
    const newConfig: FunctionTreeNode = new FunctionNodeBuilder(node, this.config)
      .withRandomId()
      .withSortInfo(this.enableSorting)
      .build();
    const currentConfig: FunctionTreeNode = this.currentFunctions[index];
    return ChartUtils.mergeConfig(currentConfig, newConfig);
  }

  private handleSaveConfig(data: FunctionTreeNode) {
    if (this.selectedNode) {
      this.selectedNode.functionFamily = data.functionFamily || '';
      this.selectedNode.functionType = data.functionType || '';
      this.selectedNode.displayName = data.displayName;
      this.selectedNode.selectedCondition = data.functionFamily + ' ' + data.functionType;
      this.selectedNode.sorting = data.sorting;
      this.selectedNode.displayAsColumn = data.displayAsColumn;
      this.selectedNode.isShowNElements = data.isShowNElements;
      this.selectedNode.numElemsShown = data.numElemsShown;
    }
    data.selectedConfig = data.functionFamily + ' ' + data.functionType;

    this.isModalOpen = false;

    this.closeOptions();
    QueryBuilderStoreModule.updateConfig({
      data: ConfigDataUtils.createFunctionData(data),
      configType: this.configType
    });
    DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private handleChangeField(child: ContextData, profileField: FieldDetailInfo) {
    const clonedNode = ConfigDataUtils.createNewNode(child.data.node, profileField);
    if (ChartUtils.isDifferentFieldType(child.data.node.field, profileField.field)) {
      this.setDefaultFunction(clonedNode);
    }
    this.updateConfig(clonedNode, child.data.i);
  }

  private handleClickField(target: any, event: any, data: ContextData['data']) {
    this.openContext(target, event, data);

    if (this.selectedNode && this.selectedNode.field) {
      if (this.selectedNode.field.dbName === DatabaseSchemaModule.dbNameSelected) {
        this.fieldContextStatus = Status.Loaded;
        const selectedTable = DatabaseSchemaModule.databaseSchema?.tables.find(table => table.name === this.selectedNode?.field?.tblName);
        if (selectedTable) {
          const profileFields: FieldDetailInfo[] = selectedTable.columns.map(
            column =>
              new FieldDetailInfo(
                new Field(selectedTable.dbName, selectedTable.name, column.name, column.className),
                column.name,
                column.displayName,
                SchemaUtils.isNested(selectedTable.name),
                false
              )
          );
          this.profileFields = profileFields;
        } else {
          this.fieldContextStatus = Status.Error;
          this.errorMessage = "Can't find fields of this table";
        }
      } else {
        DatabaseSchemaModule.handleGetDatabaseSchema(this.selectedNode.field.dbName)
          .then(resp => {
            this.selectedDatabaseSchema = resp;
            if (this.selectedDatabaseSchema) {
              const selectedTable = this.selectedDatabaseSchema.tables.find(table => table.name === this.selectedNode?.field?.tblName);
              if (selectedTable) {
                const profileFields: FieldDetailInfo[] = selectedTable.columns.map(
                  column =>
                    new FieldDetailInfo(
                      new Field(selectedTable.dbName, selectedTable.name, column.name, column.className),
                      column.name,
                      column.displayName,
                      SchemaUtils.isNested(selectedTable.name),
                      false
                    )
                );
                this.profileFields = profileFields;
                this.fieldContextStatus = Status.Loaded;
                Log.debug(this.fieldContextStatus, 'status');
              }
            }
          })
          .catch(e => {
            this.fieldContextStatus = Status.Error;
            this.errorMessage = e;
          });
      }
    }
  }

  private setDefaultFunction(newNode: FunctionTreeNode): void {
    if (newNode.field) {
      const functionFamilyInfo: FunctionFamilyInfo = new FunctionFamilyBuilder()
        .withField(newNode.field)
        .withConfig(this.config)
        .build();
      newNode.functionFamily = functionFamilyInfo.family;
      newNode.functionType = functionFamilyInfo.type;
    }
  }

  private emitItemDragging(isDragging: boolean): void {
    this.$emit('onItemDragging', isDragging, this.config.key);
  }

  private handleDragItem(): void {
    PopupUtils.hideAllPopup();
    this.isItemDragging = true;
    this.emitItemDragging(true);
  }
}
