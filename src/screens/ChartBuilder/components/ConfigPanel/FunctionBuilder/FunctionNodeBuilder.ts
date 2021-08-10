/*
 * @author: tvc12 - Thien Vi
 * @created: 5/20/21, 2:56 PM
 */

import { DraggableConfig, FunctionFamilyInfo, FunctionTreeNode, SortTypes } from '@/shared';
import { ChartUtils, RandomUtils } from '@/utils';
import { cloneDeep, isString } from 'lodash';
import { Field } from '@core/domain/Model';
import { FunctionFamilyBuilder } from '@/screens/ChartBuilder/components/ConfigPanel/FunctionBuilder/FunctionFamilyBuilder';

export class FunctionNodeBuilder {
  private id?: number;
  private enableSorting = false;
  private isCreateFunctionFamily = false;

  constructor(private data: FunctionTreeNode, private config: DraggableConfig) {}

  private static configFunction(newNode: FunctionTreeNode, oldNode: FunctionTreeNode, config: DraggableConfig, isCreateFunctionFamily: boolean): void {
    const field = ChartUtils.getField(oldNode) as Field;
    newNode.field = field;
    newNode.displayAsColumn = false;

    if (isCreateFunctionFamily || !isString(newNode.functionFamily)) {
      const functionFamilyInfo: FunctionFamilyInfo = new FunctionFamilyBuilder()
        .withField(field)
        .withConfig(config)
        .build();
      newNode.functionFamily = functionFamilyInfo.family;
      newNode.functionType = functionFamilyInfo.type;
    }
  }

  private static configDisplayName(newNode: FunctionTreeNode, oldNode: FunctionTreeNode): void {
    if (!isString(newNode.displayName)) {
      newNode.displayName = oldNode.title;
    }
  }

  private static configSorting(newNode: FunctionTreeNode, oldNode: FunctionTreeNode, enableSorting: boolean): void {
    newNode.isShowNElements = oldNode.isShowNElements ?? false;
    newNode.numElemsShown = oldNode.numElemsShown ?? 10;
    if (enableSorting) {
      newNode.sorting = SortTypes.AscendingOrder;
    } else {
      newNode.sorting = SortTypes.AscendingOrder;
    }
  }

  withRandomId(min = 0, max = 5000): FunctionNodeBuilder {
    this.id = RandomUtils.nextInt(min, max);
    return this;
  }

  withSortInfo(enableSorting: boolean): FunctionNodeBuilder {
    this.enableSorting = enableSorting;
    return this;
  }

  build(): FunctionTreeNode {
    this.data.optionsOpened = false;
    const clonedNode: FunctionTreeNode = cloneDeep(this.data);
    clonedNode.id = this.id ?? this.data.id ?? -1;
    FunctionNodeBuilder.configFunction(clonedNode, this.data, this.config, this.isCreateFunctionFamily);
    FunctionNodeBuilder.configDisplayName(clonedNode, this.data);
    FunctionNodeBuilder.configSorting(clonedNode, this.data, this.enableSorting);
    return clonedNode;
  }

  withForceCreateFunctionFamily(): this {
    this.isCreateFunctionFamily = true;
    return this;
  }
}
