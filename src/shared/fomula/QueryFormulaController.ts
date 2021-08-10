import { DatabaseSchema, Column, TableSchema } from '@core/domain/Model';
import { FormulaController } from '@/shared/fomula/FormulaController';
import { FunctionInfo } from '@/screens/ChartBuilder/stores/FormulaSuggestionStore';
import { FormulaUtils } from '@/shared/fomula/FormulaUtils';
import { Log } from '@core/utils';
import { cloneDeep } from 'lodash';
import { monaco } from 'monaco-editor-vue';

enum KeywordType {
  Keyword,
  Database,
  Table,
  Column
}

export class QueryFormulaController implements FormulaController {
  private languageRegister: any | null = null;
  private tokensProvider: any | null = null;

  private readonly allFunctions: FunctionInfo[];
  private readonly databaseSchemas: DatabaseSchema[];

  private allTables: TableSchema[];
  private allColumns: Column[];

  private allColumnsNames: Set<string>;
  private allTableNames: Set<string>;
  private allDatabaseSchemas: Set<string>;
  private defaultSuggestions: any[];

  constructor(allFunctions: FunctionInfo[], databaseSchemas: DatabaseSchema[] = []) {
    this.allFunctions = allFunctions;
    this.databaseSchemas = databaseSchemas;
    this.allDatabaseSchemas = new Set<string>(this.databaseSchemas.map(database => database.name));

    this.allTables = databaseSchemas.flatMap(database => database.tables);
    this.allTableNames = new Set<string>(this.allTables.map(table => table.name));

    this.allColumns = this.allTables.flatMap(table => table.columns);
    this.allColumnsNames = new Set<string>(this.allColumns.map(column => column.name));

    this.defaultSuggestions = FormulaUtils.getDefaultSuggestions(databaseSchemas).concat(FormulaUtils.createSuggestKeywords(allFunctions));
  }

  formulaName(): string {
    return 'di-query';
  }

  formulaTheme(): string {
    return 'query-theme';
  }

  init(monaco: any): void {
    monaco.languages.register({ id: this.formulaName() });

    this.tokensProvider = this.initTokenProvider(monaco);

    this.languageRegister = monaco.languages.registerCompletionItemProvider(this.formulaName(), {
      triggerCharacters: ['.', '(', ','],
      provideCompletionItems: (model: any, position: any, context: any, token: any) => {
        Log.debug('context::', model, position, context, token);
        if (this.isTriggers(context, ['.']) || this.canSuggestionExact(model.getValue(), position)) {
          Log.debug('provideCompletionItems::custom');
          const keyword = FormulaUtils.findNearestKeyword(model.getValue(), position, '\\b\\w+(?=\\.)\\b');
          Log.debug('provideCompletionItems::', keyword);
          if (keyword) {
            return this.createSuggestionByKeyword(keyword);
          } else {
            return this.createDefaultSuggestion();
          }
        } else {
          Log.debug('provideCompletionItems::default');
          return this.createDefaultSuggestion();
        }
      }
    });
  }

  dispose(): void {
    this.languageRegister?.dispose();
    this.tokensProvider?.dispose();
  }

  private isTriggers(context: any, triggers: string[]): boolean {
    const isCharacterTrigger = context.triggerKind == monaco.languages.CompletionTriggerKind.TriggerCharacter;
    const isTriggerExisted = triggers.some(trigger => trigger == context.triggerCharacter);
    Log.debug('isTriggers::', isCharacterTrigger, isTriggerExisted);
    return isCharacterTrigger && isTriggerExisted;
  }

  private canSuggestionExact(code: string, position: any): boolean {
    const currentCode = FormulaUtils.getCorrectLineOfCode(code, position);
    Log.debug('canSuggestionExact::', currentCode);
    return !!currentCode.match(RegExp(/\w+\.\s*$/, 'gm'));
  }

  private createSuggestionByKeyword(keyword: string): any {
    const keywordType: KeywordType = this.getKeyWordType(keyword);
    Log.debug('createSuggestionByKeyword::', keywordType);
    switch (keywordType) {
      case KeywordType.Column:
        return { suggestions: [] };
      case KeywordType.Table:
        return this.createSuggestionColumn(keyword);
      case KeywordType.Database:
        return this.createSuggestionTables(keyword);
      default:
        return this.createDefaultSuggestion();
    }
  }

  private createDefaultSuggestion(): any {
    // remove reference for show suggestion immediately
    return { suggestions: cloneDeep(this.defaultSuggestions) };
  }

  private createSuggestionColumn(keyword: string): any {
    const table: TableSchema | undefined = this.allTables.find(table => table.name == keyword);
    if (table) {
      const dbName = this.databaseSchemas.find(database => database.name == table.name);
      const dbDisplayName = dbName?.displayName ?? '';
      const suggestions = FormulaUtils.createSuggestionColumnData(table.columns, dbDisplayName, table.displayName);
      return { suggestions: suggestions };
    } else {
      return {};
    }
  }

  private createSuggestionTables(keyword: string): any {
    const database: DatabaseSchema | undefined = this.databaseSchemas.find(database => database.name == keyword);
    if (database) {
      const suggestions = FormulaUtils.createSuggestionTableData(database.tables, database.displayName);
      return { suggestions: suggestions };
    } else {
      return {};
    }
  }

  // TODO: improve here set in here
  private getKeyWordType(keyword: string): KeywordType {
    if (this.allDatabaseSchemas.has(keyword)) {
      return KeywordType.Database;
    }
    if (this.allTableNames.has(keyword)) {
      return KeywordType.Table;
    }
    if (this.allColumnsNames.has(keyword)) {
      return KeywordType.Column;
    }
    return KeywordType.Keyword;
  }

  // see more option in https://microsoft.github.io/monaco-editor/monarch.html
  private initTokenProvider(monaco: any): any {
    // register color
    return monaco.languages.setMonarchTokensProvider(this.formulaName(), {
      keywords: this.allFunctions.map(func => func.name),
      databases: Array.from(this.allDatabaseSchemas),
      tables: Array.from(this.allTableNames),
      columns: Array.from(this.allColumnsNames),
      operators: ['+'],
      symbols: /[=><!~?:&|+\-*/^%]+/,
      tokenizer: {
        root: [
          [
            /[a-z_$][\w$]*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@databases': 'databases',
                '@tables': 'tables',
                '@columns': 'columns'
              }
            }
          ],
          [/\[.*?]/, 'field'],

          // numbers
          [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],

          // delimiter: after number because of .\d floats
          [/[;,.]/, 'delimiter']
        ]
      }
    });
  }
}
