import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared';
import { Column, TableSchema } from '@core/domain/Model';

/* eslint @typescript-eslint/camelcase: 0 */

/* eslint @typescript-eslint/no-use-before-define: 0*/

export interface FunctionInfo {
  name: string;
  title?: string;
  description: string;
  example?: string;
}

export abstract class SupportedFunctionInfo {
  // list keyword supported
  // @ts-ignored
  supported_functions: string[];

  [key: string]: FunctionInfo[];

  static empty() {
    return { supported_functions: [] };
  }
}

@Module({ dynamic: true, namespaced: true, store: store, name: Stores.formulaSuggestionStore })
export class FormulaSuggestionStore extends VuexModule {
  // private supportedFunctions: any = require('@/shared/data/supported_function.json');
  private tableSchema: TableSchema | null = null;

  private supportedFunctionInfo: SupportedFunctionInfo = SupportedFunctionInfo.empty();

  get supportedFunctionNames(): string[] {
    return this.supportedFunctionInfo.supported_functions ?? [];
  }

  get getFunctionInfo(): (keyword: string) => FunctionInfo | undefined {
    return (keyword: string) => this.allFunctions.find(fn => fn.name === keyword);
  }

  get getFunctions(): (selectedFunction: string) => FunctionInfo[] {
    return (selectedFunction: string) => {
      return this.supportedFunctionInfo[`${selectedFunction}`] ?? [];
    };
  }

  get allFunctions(): FunctionInfo[] {
    return this.supportedFunctionNames.flatMap(name => this.getFunctions(name));
  }

  get columns(): Column[] {
    return this.tableSchema?.columns ?? [];
  }

  @Mutation
  reset() {
    this.tableSchema = null;
  }

  /**
   * Init suggestion with fileNames, file must in folder model
   * @param fileNames file in  @/shared/data
   */
  @Mutation
  initSuggestFunction(fileNames: string[]): void {
    const allSupportedFunctions: SupportedFunctionInfo[] = fileNames.map(fileName => require('@/shared/data/' + fileName));
    const finalSupportedFunctionInfo = SupportedFunctionInfo.empty();

    allSupportedFunctions.forEach(supportedInfo => {
      const supportedFunctions = [...finalSupportedFunctionInfo.supported_functions, ...supportedInfo.supported_functions];
      Object.assign(finalSupportedFunctionInfo, supportedInfo, {
        supported_functions: supportedFunctions
      });
    });
    this.supportedFunctionInfo = finalSupportedFunctionInfo;
  }

  @Mutation
  initSuggestField(tableSchema: TableSchema): void {
    this.tableSchema = tableSchema;
  }
}

export const FormulaSuggestionModule = getModule(FormulaSuggestionStore);
