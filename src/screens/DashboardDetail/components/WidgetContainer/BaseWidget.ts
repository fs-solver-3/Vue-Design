import { Component, Vue } from 'vue-property-decorator';
import { WidgetRenderer } from '@chart/WidgetRenderer';

/**
 * @deprecated will remove as soon as
 */
export interface Zoomable {
  isHorizontalZoomIn(): boolean;

  isHorizontalZoomOut(): boolean;
}

// @ts-ignore
@Component
export abstract class BaseWidget extends Vue {
  protected abstract renderer: WidgetRenderer<BaseWidget>;

  abstract resize(): void;

  render(h: any): any {
    return this.renderer.render(this, h);
  }
}
