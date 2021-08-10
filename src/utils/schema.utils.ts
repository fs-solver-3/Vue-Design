import { DatabaseInfo, DatabaseSchema, Column, Field, NestedColumn, TableSchema } from '@core/domain/Model';
import { SlTreeNodeModel } from '@/shared/components/builder/treemenu/SlVueTree';
import { IconUtils } from '@/utils/icon.utils';
import { ConditionTreeNode, FunctionTreeNode, GroupedField, SelectOption } from '@/shared';
import { ChartUtils } from '@/utils/chart.utils';
import { ListUtils } from '@/utils/list.utils';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';

export abstract class SchemaUtils {
  static toTableSchemaNodes(databaseSchema: DatabaseSchema, isExpanded = false): SlTreeNodeModel<TableSchema>[] {
    return databaseSchema.tables.map(table => {
      return {
        title: table.displayName,
        tag: table,
        data: table,
        isExpanded: isExpanded,
        children: this.getTableAsNodes(table)
      };
    });
  }

  static buildFieldsFromTableSchemas(tables: TableSchema[]): FieldDetailInfo[] {
    return tables.map(table => this.buildFieldsFromTableSchema(table)).flat();
  }

  static buildDateFieldsFromTableSchemas(tables: TableSchema[]): FieldDetailInfo[] {
    return tables
      .map(table => this.buildFieldsFromTableSchema(table))
      .flat()
      .filter(profileField => ChartUtils.isDateType(profileField.field.fieldType));
  }

  static buildFieldsFromTableSchema(table: TableSchema): FieldDetailInfo[] {
    const result: FieldDetailInfo[] = [];
    table.columns.forEach(col => {
      if (col instanceof NestedColumn) {
        const nestedCols: FieldDetailInfo[] = [];
        col.nestedColumns.map(nestedCol => {
          const field = new Field(table.dbName, table.name, `\`${col.name}.${nestedCol.name}\``, nestedCol.className);
          nestedCols.push(new FieldDetailInfo(field, nestedCol.name, nestedCol.displayName, true));
        });
        result.push(...nestedCols);
      } else {
        const field = new Field(table.dbName, table.name, col.name, col.className);
        result.push(new FieldDetailInfo(field, col.name, col.displayName, false));
      }
    });
    return result;
  }

  static search(options: SelectOption[], searchString?: string | null): SelectOption[] {
    const searchStringLowerCase = (searchString ?? '').toLocaleLowerCase().trim();

    return options.filter(option => {
      return this.isIncludes(searchStringLowerCase, option.displayName.toLocaleLowerCase());
    });
  }

  static searchGroupedFields(groupedFields: GroupedField[], searchString?: string | null): GroupedField[] {
    const searchStringLowerCase = (searchString ?? '').toLocaleLowerCase();

    return groupedFields
      .map(groupedField => {
        const newChildren = groupedField.children.filter(profileField => {
          return this.isIncludes(searchStringLowerCase, profileField.displayName.toLocaleLowerCase());
        });
        return {
          groupTitle: groupedField.groupTitle,
          children: newChildren
        };
      })
      .filter(group => ListUtils.isNotEmpty(group.children));
  }

  static isNested(tableName: string): boolean {
    return tableName.includes('.');
  }

  static isDiff(firstField: Field, secondField: Field) {
    return (
      firstField.dbName !== secondField.dbName ||
      firstField.tblName !== secondField.tblName ||
      firstField.fieldName !== secondField.fieldName ||
      firstField.fieldType !== secondField.fieldType
    );
  }

  static sortDatabaseInfos(databases: DatabaseInfo[]): DatabaseInfo[] {
    return databases.sort((databaseA, databaseB) => databaseA.displayName.localeCompare(databaseB.displayName));
  }

  static sort(databaseSchema: DatabaseSchema): DatabaseSchema {
    databaseSchema.tables = this.sortTables(databaseSchema.tables);
    return databaseSchema;
  }

  static sortTables(tables: TableSchema[]): TableSchema[] {
    return tables
      .map(table => {
        table.columns = this.sortColumns(table.columns);
        return table;
      })
      .sort((tableA, tableB) => tableA.displayName.localeCompare(tableB.displayName));
  }

  static sortColumns(columns: Column[]): Column[] {
    return columns.sort((columnA, columnB) => columnA.displayName.localeCompare(columnB.displayName));
  }

  private static getTableAsNodes(table: TableSchema): SlTreeNodeModel<TableSchema>[] {
    return table.columns.map((col: Column) => {
      if (col instanceof NestedColumn) {
        return {
          title: col.displayName,
          isLeaf: false,
          isExpanded: false,
          tag: table,
          data: table,
          children: this.getNestedColumnsAsNodes(table, col)
        };
      } else {
        return this.getColumnAsNode(table, col, false);
      }
    });
  }

  private static getNestedColumnsAsNodes(parentTable: TableSchema, nestedColumn: NestedColumn): SlTreeNodeModel<TableSchema>[] {
    if (nestedColumn.nestedColumns) {
      return nestedColumn.nestedColumns.map(innerColumn => {
        return this.getColumnAsNode(parentTable, innerColumn, true, `\`${nestedColumn.name}.${innerColumn.name}\``);
      });
    } else {
      return [];
    }
  }

  private static getColumnAsNode(
    parentTable: TableSchema,
    col: Column,
    isNested: boolean,
    columnName = '',
    title = '',
    field?: Field
  ): SlTreeNodeModel<TableSchema> {
    return {
      title: title || col.displayName,
      isLeaf: true,
      isNested: false,
      icon: IconUtils.getIcon(col),
      tag: field || new Field(parentTable.dbName, parentTable.name, columnName || col.name, col.className),
      data: parentTable
    } as SlTreeNodeModel<TableSchema>;
  }

  private static isIncludes(searchString: string, str: string): boolean {
    if (!searchString) {
      return true;
    } else {
      return str.toLocaleLowerCase().includes(searchString);
    }
  }

  static getFieldName(conditionTreeNode: ConditionTreeNode | FunctionTreeNode) {
    const tableDisplayName = conditionTreeNode.parent.title;
    const columnDisplayName = conditionTreeNode.title;
    return `${tableDisplayName}.${columnDisplayName}`;
  }
}
