/*
 * @author: tvc12 - Thien Vi
 * @created: 5/11/21, 5:32 PM
 */

import { ConditionTreeNode, DraggableConfig, FunctionData, FunctionTreeNode } from '@/shared';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';
import { cloneDeep, isNumber } from 'lodash';
import { ChartUtils, DomUtils } from '@/utils';
import { Field } from '@core/domain/Model';
import { DragCustomEvent } from '@/screens/ChartBuilder/model/DragConfig';
import { FunctionNodeBuilder } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionBuilder/FunctionNodeBuilder';

export class ConfigDataUtils {
  static createNewNode(currentNode: FunctionTreeNode, fieldInfo: FieldDetailInfo): FunctionTreeNode {
    const clonedNode = cloneDeep(currentNode);
    clonedNode.field = fieldInfo.field;
    clonedNode.displayName = fieldInfo.displayName;
    clonedNode.title = fieldInfo.displayName;
    return clonedNode;
  }

  static createFunctionData(node: FunctionTreeNode): FunctionData {
    const field = ChartUtils.getField(node) as Field;
    return {
      id: node.id,
      field: field,
      functionFamily: node.functionFamily,
      functionType: node.functionType,
      name: node.displayName,
      sorting: node.sorting,
      tableName: node.parent.title,
      columnName: node.title,
      displayAsColumn: node.displayAsColumn,
      isNested: node.isNested || node?.path?.length > 2 || false,
      numElemsShown: node.numElemsShown,
      isShowNElements: node.isShowNElements
    };
  }

  static getDraggableConfig(element: any): DraggableConfig | undefined {
    const dragComponent: any | undefined = element.__vue__;
    return dragComponent?.componentData;
  }

  static isFromFilterSection(event: DragCustomEvent) {
    const { group, groupIndex } = this.getFilterGroupInfo(event.from);
    return !!group && isNumber(groupIndex);
  }

  // Get group and group index from CustomEvent Of vue draggable
  static getFilterGroupInfo(component: Element & any): { group?: ConditionTreeNode[]; groupIndex?: number } {
    const fromDraggableConfig = component.__vue__;
    return fromDraggableConfig?.componentData ?? {};
  }

  static toFunctionNode(conditionNode: ConditionTreeNode, config: DraggableConfig, enableSorting: boolean) {
    // TODO
    const clonedConditionNode = cloneDeep(conditionNode);
    return new FunctionNodeBuilder(clonedConditionNode as any, config)
      .withRandomId()
      .withSortInfo(enableSorting)
      .withForceCreateFunctionFamily()
      .build();
  }
}
