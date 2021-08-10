import { Routers } from '@/shared/enums/routers.enum';
import { Route } from 'vue-router';
import { DIException } from '@core/domain/Exception';
import { isNumber, isString } from 'lodash';
import { StringUtils } from '@/utils/string.utils';
import { DI } from '@core/modules';
import { DataManager } from '@core/services';
import { SecurityUtils } from './security.utils';
import router from '@/router/router';
import { DynamicFilter } from '@core/domain';
import { ListUtils } from '@/utils/list.utils';

export class RouteUtils {
  static readonly routeIgnoreCheckSession = new Set<string>([
    Routers.login,
    Routers.signup,
    Routers.forgotPassword,
    Routers.passwordRecovery,
    Routers.resendEmail,
    Routers.directVerify
  ]);

  private static get dataManager(): DataManager {
    return DI.get(DataManager);
  }

  static readonly rootRoute = new Set<string>([Routers.baseRoute]);

  static isRoot(route?: string | null): boolean {
    return RouteUtils.rootRoute.has(route || '');
  }

  static isNotNeedSession(route: string): boolean {
    return RouteUtils.routeIgnoreCheckSession.has(route);
  }

  static ensureDashboardIdIsValid(route: Route): void {
    const id = this.getDashboardId(route);
    if (isNumber(id) && !isNaN(id)) {
      if (id < 0) {
        throw new DIException('DashboardId invalid');
      }
    } else {
      throw new DIException('DashboardId not exists');
    }
  }

  static ensureDirectoryIdIsValid(route: Route): void {
    const id = this.getDirectoryId(route);
    if (isNumber(id) && !isNaN(id)) {
      if (id < 0) {
        throw new DIException('DirectoryId invalid');
      }
    } else {
      throw new DIException('DirectoryId not exists');
    }
  }

  static checkTokenIsExist(route: Route): boolean {
    const token = this.getToken(route);
    return isString(token) && StringUtils.isNotEmpty(token);
  }

  static getToken(route: Route): string {
    return route.query.token as string;
  }

  static getDashboardId(route: Route): number {
    return parseInt(route.params.dashboardId);
  }

  static getDirectoryId(route: Route): number {
    return parseInt(route.params.directoryId);
  }

  static isLogin(): boolean {
    return !!RouteUtils.dataManager.getSession();
  }

  static isHaveToken(): boolean {
    return !!RouteUtils.dataManager.getToken();
  }

  static getProfileDetailsId(route: Route): string {
    return SecurityUtils.decryptString(route.params.username);
  }

  static async navigateToDataBuilder(route: Route, routerFilters: DynamicFilter[]) {
    const query = RouteUtils.buildDataBuilderQuery(route, routerFilters);
    return router.push({
      name: Routers.chartBuilder,
      query: query
    });
  }

  static getFilters(route: Route): DynamicFilter[] {
    try {
      const filtersAsString: string = (route.query?.filters || '[]') as string;
      const filters: any[] = JSON.parse(filtersAsString);
      return filters.map(filter => DynamicFilter.fromObject(filter));
    } catch (ex) {
      return [];
    }
  }

  private static buildDataBuilderQuery(route: Route, routerFilters: DynamicFilter[]) {
    if (ListUtils.isNotEmpty(routerFilters)) {
      const filtersAsString = JSON.stringify(routerFilters);
      return {
        ...route.query,
        filters: filtersAsString
      };
    } else {
      delete route.query.filters;
      return route.query;
    }
  }
}
