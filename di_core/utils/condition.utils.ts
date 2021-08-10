import { And, Between, Condition, ConditionType, Equal, Field, FieldRelatedCondition, GetArrayElement, Id, In, Or, TableColumn } from '@core/domain/Model';
import { ConditionFamilyTypes, ConditionTreeNode, DateRange } from '@/shared';
import { ConditionData } from '@/shared/interfaces/condition_data.interface';
import { ChartUtils, FormatDateTime, ListUtils } from '@/utils';

export abstract class ConditionUtils {
  static getFamilyTypeFromFieldType(fieldType: string): ConditionFamilyTypes | undefined {
    if (ChartUtils.isDateType(fieldType)) {
      return ConditionFamilyTypes.dateHistogram;
    }
    if (ChartUtils.isTextType(fieldType)) {
      return ConditionFamilyTypes.string;
    }
    if (ChartUtils.isNumberType(fieldType)) {
      return ConditionFamilyTypes.number;
    } else {
      return void 0;
    }
  }

  static buildMainDateCondition(field: Field, currentRange: DateRange): FieldRelatedCondition {
    const rangeFormatted = {
      start: FormatDateTime.formatDate(currentRange.start),
      end: FormatDateTime.formatDate(currentRange.end)
    };
    const condition = new Between(field, rangeFormatted.start.toString(), rangeFormatted.end.toString());
    if (field.tblName.includes('.')) {
      condition.setScalarFunction(new GetArrayElement());
    }
    return condition;
  }

  static buildEqualCondition(column: TableColumn, value: string): Equal {
    return new Equal(column.function.field, value, column.function.scalarFunction);
  }

  static buildInCondition(column: TableColumn, values: string[]): In {
    return new In(column.function.field, values, column.function.scalarFunction);
  }

  /// Build conditions for drilldown
  ///
  /// nếu currentConditions rỗng => And với equal condition
  ///
  /// Nếu currentCondition có 1 item và là And condition => And với toàn bộ conditions trong firstItem và
  /// equal
  ///
  /// Trường hợp còn lại:
  ///
  /// Bọc toàn bộ condition đang có vô OR. Tạo And([Or, equal])
  static buildDrilldownConditions(currentConditions: Condition[], equal: Equal): Condition[] {
    if (ListUtils.isEmpty(currentConditions)) {
      return [new And([equal])];
    } else {
      const firstItem: Condition = currentConditions[0];
      if (ListUtils.hasOnlyOneItem(currentConditions) && firstItem instanceof And) {
        return [new And([...firstItem.conditions, equal])];
      } else {
        return [new And([new Or(currentConditions), equal])];
      }
    }
  }

  static getAllFieldRelatedConditions(conditions: Condition[]): FieldRelatedCondition[] {
    return conditions.flatMap((condition: Condition) => {
      switch (condition.className) {
        case ConditionType.And: {
          const andCondition: And = condition as And;
          return ConditionUtils.getAllFieldRelatedConditions(andCondition.conditions);
        }
        case ConditionType.Or: {
          const orCondition: Or = condition as Or;
          return ConditionUtils.getAllFieldRelatedConditions(orCondition.conditions);
        }
        default:
          return condition as FieldRelatedCondition;
      }
    });
  }

  static cloneListConditionData(listConditionData: ConditionData[]) {
    return listConditionData.map(conditionData => ConditionUtils.cloneConditionData(conditionData));
  }

  private static cloneConditionData(conditionData: ConditionData) {
    return {
      ...conditionData,
      field: Field.fromObject(conditionData.field)
    };
  }
}

export abstract class ConditionDataUtils {
  static toConditionTreeNodes(map: Map<number, ConditionData[]>): ConditionTreeNode[][] {
    const data: ConditionTreeNode[][] = [];
    map.forEach((conditions, groupId) => {
      const dataFlavors: ConditionTreeNode[] = conditions.map(condition => {
        const allValues = condition.allValues ?? [condition.firstValue, condition.secondValue];

        return {
          id: condition.id,
          groupId: condition.groupId,
          firstValue: condition.firstValue,
          secondValue: condition.secondValue,
          filterFamily: condition.familyType,
          filterType: condition.subType,
          filterCondition: ChartUtils.buildNameOfFilter(condition.subType || '', condition.firstValue || '', condition.secondValue || ''),
          isExpanded: true,
          field: condition.field,
          title: condition.columnName || 'Unknown',
          parent: {
            title: condition.tableName || 'Unknown'
          },
          isNested: condition.isNested || false,
          currentInputType: condition.currentInputType,
          currentOptionSelected: condition.currentOptionSelected,
          filterModeSelected: condition.filterModeSelected,
          allValues: allValues.filter(item => item !== '')
        } as ConditionTreeNode;
      });
      data.push(dataFlavors);
    });
    return data;
  }

  static toFilters(filters: Record<Id, ConditionData[]>): Map<Id, ConditionData[]> {
    const entries: [number, ConditionData[]][] = Object.entries(filters).map(([key, listConditionData], index) => {
      return [parseInt(key), ConditionUtils.cloneListConditionData(listConditionData)];
    });
    return new Map<Id, ConditionData[]>(entries);
  }
}
