import { PanelSettingResolver } from '@/shared/Resolver/PanelSettingResolver/PanelSettingResolver';
import { PanelHandler } from '@/shared/Resolver/PanelSettingResolver/PanelSettingHandler/PanelHandler';

export class PanelSettingResolverBuilder {
  private mapCreator = new Map<string, PanelHandler>();

  add(type: string, handler: PanelHandler): PanelSettingResolverBuilder {
    this.mapCreator.set(type, handler);
    return this;
  }

  build(): PanelSettingResolver {
    return new PanelSettingResolver(this.mapCreator);
  }
}
