/*
 * @author: tvc12 - Thien Vi
 * @created: 7/21/21, 10:41 AM
 */

import { Component, Vue } from 'vue-property-decorator';
import { Log } from '@core/utils';
// Class for auto hide context menu when scroll
// @ts-ignore
@Component
export abstract class AutoHideContextMenu extends Vue {
  // by px
  protected maxScrollSize = 100;
  private currentYOffset = 0;
  private currentXOffset = 0;

  abstract hide(): void;

  protected handleBodyScroll(event: Event) {
    const isOverflowY = Math.abs(this.currentYOffset - window.pageYOffset) > this.maxScrollSize;
    if (isOverflowY) {
      this.hide();
      return;
    }

    const isOverflowX = Math.abs(this.currentXOffset - window.pageXOffset) > this.maxScrollSize;
    if (isOverflowX) {
      this.hide();
      return;
    }
  }

  protected listenScroll() {
    this.currentYOffset = window.pageYOffset;
    this.currentXOffset = window.pageXOffset;
    window.addEventListener('scroll', this.handleBodyScroll);
  }

  protected removeListenScroll() {
    window.removeEventListener('scroll', this.handleBodyScroll);
  }
}
