import { Column, ColumnType } from '@core/domain/Model';

export abstract class IconUtils {
  static getIcon(column: Column): string {
    if (column.isMaterialized()) {
      return this.getIconFunctionByColumnType(column.className);
    } else {
      return this.getIconByColumnType(column.className);
    }
  }

  private static getIconByColumnType(className: ColumnType) {
    switch (className) {
      case ColumnType.date:
      case ColumnType.datetime:
      case ColumnType.datetime64:
        return 'builder/ic_16_data_date.svg';
      case ColumnType.int8:
      case ColumnType.int16:
      case ColumnType.int32:
      case ColumnType.int64:
      case ColumnType.uint8:
      case ColumnType.uint16:
      case ColumnType.uint32:
      case ColumnType.uint64:
      case ColumnType.double:
      case ColumnType.float:
      case ColumnType.float64:
        return 'builder/ic_16_data_number.svg';
      default:
        return 'builder/ic_16_data_string.svg';
    }
  }

  private static getIconFunctionByColumnType(className: ColumnType) {
    switch (className) {
      case ColumnType.date:
      case ColumnType.datetime:
      case ColumnType.datetime64:
        return 'builder/ic_16_function_date.svg';
      case ColumnType.int8:
      case ColumnType.int16:
      case ColumnType.int32:
      case ColumnType.int64:
      case ColumnType.uint8:
      case ColumnType.uint16:
      case ColumnType.uint32:
      case ColumnType.uint64:
      case ColumnType.double:
      case ColumnType.float:
      case ColumnType.float64:
        return 'builder/ic_16_function_number.svg';
      default:
        return 'builder/ic_16_function_string.svg';
    }
  }
}
