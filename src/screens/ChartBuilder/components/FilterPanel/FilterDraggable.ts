import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { ConditionData, ConditionTreeNode, DataFlavor, DraggableConfig, DropMode, FunctionTreeNode, VisualizationItemData } from '@/shared';
import { ChartUtils, DomUtils, ListUtils, RandomUtils } from '@/utils';
import { Field, Id } from '@core/domain/Model';
import DropArea from '@/shared/components/DropArea.vue';
import DropItem from '@/shared/components/DropItem.vue';
import VueContext from 'vue-context';
import { Drop } from 'vue-drag-drop';
import { CollapseTransition } from 'vue2-transitions';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { ConditionDataUtils, Log } from '@core/utils';
import DiButton from '@/shared/components/DiButton.vue';
import FilterItem from './FilterItem.vue';
import { IdGenerator } from '@/utils/id_generator';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import draggable from 'vuedraggable';
import { Accept, CloneWhenDrop, Deny, DragCustomEvent, DropOptions, GroupConfig } from '@/screens/ChartBuilder/model/DragConfig';
import { cloneDeep, isNumber, isString } from 'lodash';
import { ConfigDataUtils } from '@/screens/ChartBuilder/components/ConfigPanel/ConfigDataUtils';

@Component({
  components: {
    DropArea,
    DropItem,
    VueContext,
    Drop,
    CollapseTransition,
    DiButton,
    FilterItem,
    draggable
  }
})
export default class FilterDraggable extends Vue {
  @Ref()
  btnRef!: any;
  private conditions: ConditionTreeNode[][] = [];
  private dropMode: DropMode = DropMode.None;
  private loaded = false;
  private isItemDragging = false;
  private insertAt?: number;

  @Prop({ required: true })
  private draggableConfig!: DraggableConfig;

  @Prop({ type: Boolean, default: false })
  private hasDragging!: boolean;

  @Prop({ type: Boolean, default: true })
  private showTitle!: boolean;

  @Ref()
  private readonly menu?: VueContext;

  @Ref()
  private fieldContext!: any;
  private supportedGroupNames: Set<string> = new Set(['group-and-draggable', 'group-or-draggable']);

  private get defaultConditions(): Map<Id, ConditionData[]> {
    return QueryBuilderStoreModule.filterAsMap;
  }

  private get itemSelected(): VisualizationItemData {
    return QueryBuilderStoreModule.itemSelected;
  }

  private get canShowPlaceHolder(): boolean {
    return ListUtils.isEmpty(this.conditions);
  }

  private get orGroupConfig(): GroupConfig {
    return {
      name: 'group-or-draggable',
      revertClone: true,
      put: DropOptions.Accept,
      pull: DropOptions.Deny
    };
  }

  private get andGroupConfig(): GroupConfig {
    return {
      name: 'group-and-draggable',
      revertClone: true,
      put: DropOptions.Accept,
      pull: this.handlePull
    };
  }

  static toConditionNode(functionNode: FunctionTreeNode): ConditionTreeNode {
    return this.createConditionNodeFrom(functionNode as any);
  }

  private static createConditionNodeFrom(data: ConditionTreeNode, isDifferentGroup = false): ConditionTreeNode {
    const newData = cloneDeep(data) as ConditionTreeNode;
    newData.id = RandomUtils.nextInt(0, 900000);
    if (isDifferentGroup) {
      newData.groupId = RandomUtils.nextInt(0, 900000);
    }
    newData.firstValue = data.firstValue ?? '';
    newData.secondValue = data.secondValue ?? '';
    newData.filterCondition = data.filterCondition ?? '';
    newData.field = ChartUtils.getField(data) as Field;
    if (!isString(newData.filterFamily)) {
      newData.filterFamily = ChartUtils.getFilterFamily(newData);
      newData.filterType = ChartUtils.getFilterType(newData.filterFamily);
    }
    return newData;
  }

  private static mergeConditionNode(group: ConditionTreeNode[], node: ConditionTreeNode, index: number) {
    const newNode: ConditionTreeNode = FilterDraggable.createConditionNodeFrom(node, true);
    const currentNode: ConditionTreeNode = group[index];

    return ChartUtils.mergeCondition(currentNode, newNode);
  }

  private handlePull(to: any, from: any): Accept | Deny | CloneWhenDrop {
    const toGroupName: string = to.options?.group?.name ?? '';
    return this.supportedGroupNames.has(toGroupName) ? DropOptions.CloneWhenDrop : DropOptions.CloneWhenDrop;
  }

  @Watch('defaultConditions', { immediate: true })
  private handleDefaultConditionsChanged() {
    if (!this.loaded && this.defaultConditions.size !== 0) {
      this.loaded = true;
      this.conditions = ConditionDataUtils.toConditionTreeNodes(this.defaultConditions);
    }
  }

  private handleDropOrGroup(data: DataFlavor<ConditionTreeNode>, enableShowFilter = true) {
    if (data && data.node) {
      const newNode: ConditionTreeNode = FilterDraggable.createConditionNodeFrom(data.node, true);
      const andGroup = [newNode];
      this.conditions.push(andGroup);

      this.dropMode = DropMode.DropOr;
      const conditionData: ConditionData = ChartUtils.toConditionData(newNode);
      this.handleAddNewCondition(conditionData, enableShowFilter);
    }
  }

  private handleDropAndGroup(andGroup: ConditionTreeNode[], data: DataFlavor<ConditionTreeNode>, event: any): void {
    Log.debug('handleDropAnd::');
    event.stopPropagation();
    if (data && data.node) {
      const newNode: ConditionTreeNode = FilterDraggable.createConditionNodeFrom(data.node);
      newNode.groupId = andGroup[0].groupId;
      andGroup.push(newNode);

      this.dropMode = DropMode.DropAnd;
      const conditionData: ConditionData = ChartUtils.toConditionData(newNode);
      this.handleAddNewCondition(conditionData);
    }
  }

  private removeItem(groupIndex: number, nodeIndex: number): void {
    const currentCondition = this.conditions[groupIndex][nodeIndex];
    this.conditions[groupIndex].splice(nodeIndex, 1);
    if (ListUtils.isEmpty(this.conditions[groupIndex])) {
      this.conditions.splice(groupIndex, 1);
    }
    QueryBuilderStoreModule.removeFilter({
      groupId: currentCondition.groupId,
      id: currentCondition.id
    });
  }

  private updateFilter(selectedNode: ConditionTreeNode): void {
    const conditionData: ConditionData = ChartUtils.toConditionData(selectedNode);
    QueryBuilderStoreModule.updateFilter(conditionData);
    DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private handleAddNewCondition(conditionData: ConditionData, enableShowFilter = true) {
    switch (this.dropMode) {
      case DropMode.DropAnd:
      case DropMode.DropOr:
      case DropMode.DropOrAndInsert:
        {
          QueryBuilderStoreModule.addFilter({
            data: conditionData,
            index: this.insertAt
          });
          // QueryBuilderStoreModule.renderVisualizationPanel();
          this.insertAt = void 0;
          const filterId: string = this.genFilterId(conditionData.groupId, conditionData.id);
          if (enableShowFilter) {
            this.showFilter(filterId);
          }
        }
        break;
      case DropMode.DropOrAndReplace:
        {
          QueryBuilderStoreModule.updateFilter(conditionData);
          DataBuilderModule.buildQueryAndRenderVizPanel();
        }
        break;
    }
  }

  private handleReplaceCondition(group: ConditionTreeNode[], data: [ConditionTreeNode, number]) {
    const [node, index] = data;
    if (node) {
      const clonedNode = FilterDraggable.mergeConditionNode(group, node, index);
      if (clonedNode.field && ChartUtils.isDifferentFieldType(group[index].field, clonedNode.field)) {
        ChartUtils.resetNodeData(clonedNode);
      }
      this.updateConditionNode(group, clonedNode, index);
    }
  }

  private updateConditionNode(group: ConditionTreeNode[], conditionTreeNode: ConditionTreeNode, index: number) {
    group.splice(index, 1, conditionTreeNode);
    QueryBuilderStoreModule.updateFilter(ChartUtils.toConditionData(conditionTreeNode));
    DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private handleInsertCondition(group: ConditionTreeNode[], enableShowFilter: boolean, data: [ConditionTreeNode, number]) {
    const [node, index] = data;
    if (node) {
      const clonedNode = FilterDraggable.createConditionNodeFrom(node, true);
      this.insertAt = index;
      clonedNode.groupId = group[0]?.groupId;
      group.splice(index, 0, clonedNode);

      this.dropMode = DropMode.DropOrAndInsert;
      const conditionData: ConditionData = ChartUtils.toConditionData(clonedNode);
      this.handleAddNewCondition(conditionData, enableShowFilter);
    }
  }

  private handleOpenMenu(data: [MouseEvent, { conditionTreeNode: ConditionTreeNode; i: number; j: number; editFn: () => void }]) {
    const [mouseEvent, menuData] = data;
    this.menu?.open(mouseEvent, menuData);
  }

  private handleOnFilterChanged(data: [ConditionTreeNode[], ConditionTreeNode, number]) {
    const [group, newNode, index] = data;
    this.updateConditionNode(group, newNode, index);
  }

  private async handleDeleteFilter(data: [number, number]) {
    this.removeItem(data[0], data[1]);
    await DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private showFilter(filterId: string): void {
    this.$root.$emit('bv::hide::popover');

    // Wait for animation adding completed
    this.$nextTick(() => {
      setTimeout(() => {
        this.$root.$emit('bv::show::popover', filterId);
      }, 250);
    });
  }

  // id pattern: filter-[groupId]-[nodeId]
  private genFilterId(groupId: number, nodeId: number): string {
    return IdGenerator.generateFilterId(groupId, nodeId);
  }

  private handleConfigFilter(data: { editFn: () => void }): void {
    this.menu?.close();
    data.editFn();
  }

  // drag có thể đến từ mọi nguồn, nếu data có added:

  private handleAddNewGroupFromOtherSection(listFunctionTreeNode: FunctionTreeNode[]): void {
    Log.debug('handleAddNewGroupFromOtherSection::', listFunctionTreeNode);
    // always has one item in listFunctionTreeNode;
    const functionNode: FunctionTreeNode | undefined = ListUtils.getHead(listFunctionTreeNode);
    if (functionNode) {
      const conditionNode: ConditionTreeNode = FilterDraggable.toConditionNode(functionNode);
      this.handleDropOrGroup({ node: conditionNode });
    }
  }

  private async handleAddNewGroupFromFilterSection(event: DragCustomEvent): Promise<void> {
    const { group, groupIndex } = ConfigDataUtils.getFilterGroupInfo(event.from);
    if (group && group.length > 1 && isNumber(groupIndex)) {
      const conditionNode: ConditionTreeNode = group[groupIndex];
      this.removeItem(groupIndex, groupIndex);
      this.handleDropOrGroup({ node: conditionNode }, false);
      await DataBuilderModule.buildQueryAndRenderVizPanel();
    }
  }

  //      [function, index] element và newIndex => đến từ function insert at index
  private handleChangeCondition(group: ConditionTreeNode[], groupIndex: number, data: any): void {
    Log.debug('handleInsertConditionFromOtherSection::', data);
    const { element, newIndex } = data?.added ?? {};
    if (element && isNumber(newIndex)) {
      const conditionNode: ConditionTreeNode = FilterDraggable.toConditionNode(element);
      this.handleInsertCondition(group, true, [conditionNode, newIndex]);
    }
  }

  private async handleNewConditionFromFilterSection(toGroup: ConditionTreeNode[], toGroupIndex: number, event: DragCustomEvent): Promise<void> {
    const { group, groupIndex } = ConfigDataUtils.getFilterGroupInfo(event.from);
    const fromIndex = event.oldDraggableIndex;
    const toIndex = event.newDraggableIndex;
    if (group && isNumber(groupIndex)) {
      const conditionNode: ConditionTreeNode = group[fromIndex];
      this.removeItem(groupIndex, fromIndex);
      this.handleInsertCondition(toGroup, false, [conditionNode, toIndex]);
      await DataBuilderModule.buildQueryAndRenderVizPanel();
    }
  }

  private emitItemDragging(isDragging: boolean): void {
    this.$emit('onItemDragging', isDragging, this.draggableConfig.key);
  }
}
