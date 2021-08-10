import { DI } from '@core/modules';
import { DIKeys } from '@core/modules/di';
import { ResourceType } from '@/utils/permission_utils';

export abstract class UrlUtils {
  static getFullUrl(path: string): string {
    const staticHost = DI.get<string>(DIKeys.staticHost);
    return staticHost + path;
  }

  static createLinkShare(type: ResourceType, id: number, token: string) {
    switch (process.env.NODE_ENV) {
      case 'production':
        return this.buildProductionLink(type, id, token);

      default:
        // TODO: replace origin with evn path
        return this.buildProductionLink(type, id, token);
    }
  }

  private static buildProductionLink(type: ResourceType, id: number, token: string) {
    switch (type) {
      case ResourceType.directory:
        return `${window.location.origin}/shared/${id}?token=${token}`;
      default:
        return `${window.location.origin}/${type}/${id}?token=${token}`;
    }
  }
}
