import { ConfigType, FunctionData, FunctionTreeNode } from '@/shared';
import { Field, ScalarFunction } from '@core/domain/Model';

export abstract class FunctionDataUtils {
  static toFunctionTreeNodes(defaultConfigs: FunctionData[]): FunctionTreeNode[] {
    return defaultConfigs.map(config => {
      return {
        id: config.id,
        functionType: config.functionType,
        functionFamily: config.functionFamily,
        optionsOpened: false,
        selectedConfig: config.functionFamily + ' ' + config.functionType,
        selectedCondition: config.functionFamily + ' ' + config.functionType,
        displayName: config.name,
        sorting: config.sorting,
        field: config.field,
        title: config.columnName || 'Unknown',
        parent: {
          title: config.tableName || 'Unknown'
        },
        displayAsColumn: config.displayAsColumn || false,
        isNested: config.isNested || false,
        numElemsShown: config.numElemsShown,
        isShowNElements: config.isShowNElements ?? false
      } as FunctionTreeNode;
    });
  }

  static toConfigAsMap(configs: Record<ConfigType, FunctionData[]>): Map<ConfigType, FunctionData[]> {
    const entries: [ConfigType, FunctionData[]][] = Object.entries(configs).map(([key, values], index) => {
      return [key as ConfigType, this.cloneListFunctionData(values)];
    });
    return new Map<ConfigType, FunctionData[]>(entries);
  }

  static cloneListFunctionData(list: FunctionData[]): FunctionData[] {
    return list.map(functionData => this.cloneFunctionData(functionData));
  }

  static cloneFunctionData(data: FunctionData): FunctionData {
    return {
      ...data,
      field: Field.fromObject(data.field)
    };
  }
}

export const getScalarFunction = (obj: any): ScalarFunction | undefined => {
  if (obj) {
    return ScalarFunction.fromObject(obj);
  } else {
    return void 0;
  }
};
