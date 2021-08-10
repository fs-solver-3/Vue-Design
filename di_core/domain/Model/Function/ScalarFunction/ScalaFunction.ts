/*
 * @author: tvc12 - Thien Vi
 * @created: 5/30/21, 9:08 PM
 */

import {
  GetArrayElement,
  ScalarFunctionType,
  ToDayNum,
  ToDayOfMonth,
  ToDayOfWeek,
  ToDayOfYear,
  ToHour,
  ToHourNum,
  ToMinute,
  ToMinuteNum,
  ToMonth,
  ToMonthNum,
  ToQuarter,
  ToQuarterNum,
  ToSecond,
  ToSecondNum,
  ToWeekNum,
  ToYear,
  ToYearNum
} from '@core/domain/Model';
import { ClassNotFound } from '@core/domain/Exception/ClassNotFound';

export abstract class ScalarFunction {
  abstract className: ScalarFunctionType;
  innerFn?: ScalarFunction;

  protected constructor(innerFn?: ScalarFunction) {
    this.innerFn = innerFn;
  }

  static fromObject(obj: any): ScalarFunction {
    switch (obj.className) {
      case ScalarFunctionType.ToYear:
        return ToYear.fromObject(obj);
      case ScalarFunctionType.ToQuarter:
        return ToQuarter.fromObject(obj);
      case ScalarFunctionType.ToMonth:
        return ToMonth.fromObject(obj);
      case ScalarFunctionType.ToDayOfYear:
        return ToDayOfYear.fromObject(obj);
      case ScalarFunctionType.ToDayOfMonth:
        return ToDayOfMonth.fromObject(obj);
      case ScalarFunctionType.ToDayOfWeek:
        return ToDayOfWeek.fromObject(obj);
      case ScalarFunctionType.ToHour:
        return ToHour.fromObject(obj);
      case ScalarFunctionType.ToMinute:
        return ToMinute.fromObject(obj);
      case ScalarFunctionType.ToSecond:
        return ToSecond.fromObject(obj);
      case ScalarFunctionType.ToYearNum:
        return ToYearNum.fromObject(obj);
      case ScalarFunctionType.ToQuarterNum:
        return ToQuarterNum.fromObject(obj);
      case ScalarFunctionType.ToMonthNum:
        return ToMonthNum.fromObject(obj);
      case ScalarFunctionType.ToWeekNum:
        return ToWeekNum.fromObject(obj);
      case ScalarFunctionType.ToDayNum:
        return ToDayNum.fromObject(obj);
      case ScalarFunctionType.ToHourNum:
        return ToHourNum.fromObject(obj);
      case ScalarFunctionType.ToMinuteNum:
        return ToMinuteNum.fromObject(obj);
      case ScalarFunctionType.ToSecondNum:
        return ToSecondNum.fromObject(obj);
      case ScalarFunctionType.GetArrayElement:
        return GetArrayElement.fromObject(obj);
      default:
        throw new ClassNotFound(`fromObject: object with className ${obj.className} not found`);
    }
  }

  withScalarFunction(innerFn: ScalarFunction) {
    if (this.innerFn) {
      this.innerFn.withScalarFunction(innerFn);
      return this;
    } else {
      this.innerFn = innerFn;
      return this;
    }
  }

  abstract getFunctionType(): string;
}
