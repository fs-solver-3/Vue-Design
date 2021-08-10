/*
 * @author: tvc12 - Thien Vi
 * @created: 5/12/21, 3:23 PM
 */

import { FunctionInfo } from '@/screens/ChartBuilder/stores/FormulaSuggestionStore';
import { monaco } from 'monaco-editor-vue';
import { DatabaseSchema, Column, TableSchema } from '@core/domain/Model';

export class FormulaUtils {
  //https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.completionitem.html
  static createSuggestKeywords(functionInfos: FunctionInfo[]): any[] {
    return functionInfos.map(functionInfo => {
      return {
        label: functionInfo.name,
        kind: monaco.languages.CompletionItemKind.Method,
        insertText: functionInfo.name,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: functionInfo.description,
        detail: functionInfo.description
      };
    });
  }

  static createSuggestFields(fieldNames: string[]): any[] {
    return fieldNames.map(displayName => {
      return {
        label: displayName,
        kind: monaco.languages.CompletionItemKind.Field,
        insertText: `[${displayName}]`,
        documentation: `Field ${displayName}`,
        detail: 'Field'
      };
    });
  }

  static createSuggestionColumnData(columns: Column[], dbDisplayName: string, tableDisplayName: string): any[] {
    return columns.map(column => {
      return {
        label: column.displayName,
        kind: monaco.languages.CompletionItemKind.Property,
        insertText: column.name,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: `Column ${column.displayName}`,
        detail: `from ${dbDisplayName}.${tableDisplayName}`
      };
    });
  }

  static findNearestKeyword(code: string, position: { column: number; lineNumber: number }, regexPattern: string, groupIndex = 0): string | undefined {
    const currentCode = this.getCorrectLineOfCode(code, position);
    const regex = new RegExp(regexPattern, 'gm');
    let lastKeyword: string | undefined = void 0;
    // eslint-disable-next-line  no-constant-condition
    while (true) {
      const groups: string[] | null = regex.exec(currentCode);
      // const match
      if (groups) {
        lastKeyword = groups[groupIndex];
        continue;
      } else {
        return lastKeyword;
      }
    }
  }

  static createSuggestionTableData(tables: TableSchema[], dbDisplayName: string): any[] {
    return tables.map(table => {
      return {
        label: table.displayName,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: table.name,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: `Table ${table.displayName}`,
        detail: `from ${dbDisplayName}`
      };
    });
  }

  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.completionitem.html#command
  static createSuggestionDatabaseData(databaseInfos: DatabaseSchema[]): any[] {
    return databaseInfos.map(database => {
      return {
        label: database.displayName,
        kind: monaco.languages.CompletionItemKind.Class,
        insertText: database.name,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: `Database ${database.displayName}`,
        detail: database.name
      };
    });
  }

  static getDefaultSuggestions(databaseSchemas: DatabaseSchema[]): any[] {
    const suggestionDatabases = FormulaUtils.createSuggestionDatabaseData(databaseSchemas);
    const suggestionTables = databaseSchemas.flatMap(database => {
      return FormulaUtils.createSuggestionTableData(database.tables, database.displayName);
    });
    const suggestionColumns = databaseSchemas.flatMap(database => {
      return database.tables.flatMap(table => {
        return FormulaUtils.createSuggestionColumnData(table.columns, database.displayName, table.displayName);
      });
    });
    return suggestionDatabases.concat(suggestionTables).concat(suggestionColumns);
  }

  static getCorrectLineOfCode(code: string, position: { column: number; lineNumber: number }): string {
    const lines = code.split(/\n/, position.lineNumber);
    const currentLine = lines[position.lineNumber - 1] ?? '';
    let charIndex = position.column;

    for (charIndex; charIndex < currentLine.length; ++charIndex) {
      const isEmpty = !currentLine[charIndex]?.trim();
      if (isEmpty) {
        break;
      }
    }

    return currentLine.slice(0, charIndex);
  }
}
