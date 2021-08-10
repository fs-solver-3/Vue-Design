<template>
  <div v-click-outside="vcoConfig" class="di-context-menu-container">
    <ul
      v-show="menuShow"
      :style="{
        minWidth: minWidth,
        background: backgroundColor
      }"
      name="di-context-menu-container-ul"
    >
      <li
        v-for="(i, index) in items"
        :id="genBtnId('context-menu', index)"
        v-bind:key="i.text"
        :style="{
          borderBottom: i.divider,
          cursor: i.cursor || 'pointer'
        }"
        @click="i.click"
      >
        <span
          :style="{
            color: i.textColor,
            cursor: i.cursor || 'pointer'
          }"
          >{{ i.text }}</span
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ContextMenuItem } from '@/shared';
import { Log } from '@core/utils';

@Component
export default class ContextMenu extends Vue {
  @Prop({
    type: String,
    default: ''
  })
  minWidth?: string;

  @Prop({
    type: String,
    default: ''
  })
  backgroundColor?: string;

  @Prop({
    type: String,
    default: ''
  })
  iconColor?: string;

  @Prop({
    type: String,
    default: ''
  })
  textColor?: string;

  @Prop({
    type: Array,
    required: true,
    default: ''
  })
  ignoreOutsideClass?: string[];

  menuShow = false;
  items: ContextMenuItem[] = [];

  vcoConfig: any = {
    handler: this.handler,
    middleware: this.middleware,
    events: ['click']
  };

  show(event: any, items: ContextMenuItem[]) {
    this.items = this.parseInputDataToContextMenuItem(items);
    this.registerScrollEvent();
    this.$nextTick(() => {
      const contextMenuElements = document.getElementsByName('di-context-menu-container-ul');
      if (contextMenuElements && contextMenuElements[0]) {
        const menu = contextMenuElements[0] as HTMLElement;
        let menuHeight = menu.offsetHeight;
        let menuWidth = menu.offsetWidth;

        if (menuHeight < 1 || menuWidth < 1) {
          menu.style.display = 'block';
          menuHeight = menu.offsetHeight;
          menuWidth = menu.offsetWidth;
        }

        menu.style.left = this.calculatedLeft(menuWidth, event) + 'px';
        menu.style.top = this.calculatedTop(menuHeight, event) + 'px';
        this.menuShow = true;
      }
    });
  }

  public hide() {
    this.menuShow = false;
    this.removeListenerScroll();
  }

  private parseInputDataToContextMenuItem(items: ContextMenuItem[]) {
    for (const i in items) {
      items[i].textColor = this.textColor;
      if (typeof items[i].click !== 'function') {
        items[i].click = () => null;
      }

      if (items[i].disabled) {
        items[i].click = () => null;
        items[i].cursor = 'not-allowed';
        items[i].textColor = '#9b9b9b';
      }

      if (items[i].divider) {
        items[i].divider = '1px solid #ebebeb';
      }
    }
    return items;
  }

  private handler(event: any) {
    let className = event.target.className;
    const parentClassName = event.target.parentNode?.className ?? '';
    if (!(typeof className === 'string' || className instanceof String)) {
      className = className.baseVal;
    }
    if (
      className === '' ||
      typeof parentClassName === 'object' ||
      (!this.ignoreOutsideClass?.some(s => parentClassName?.includes(s)) && !this.ignoreOutsideClass?.some(s => className?.includes(s)))
    ) {
      this.hide();
    }
  }

  private middleware(event: any) {
    return event.target.className !== 'di-context-menu-container';
  }

  private removeListenerScroll() {
    document.removeEventListener('scroll', this.handleScroll);
  }

  private handleScroll(event: Event) {
    this.hide();
  }

  private registerScrollEvent() {
    document.addEventListener('scroll', this.handleScroll);
  }

  private calculatedLeft(menuWidth: number, event: MouseEvent) {
    const currentPageX = event.pageX - window.scrollX;
    if (menuWidth + currentPageX >= window.innerWidth) {
      return event.pageX - menuWidth;
    } else {
      return event.pageX;
    }
  }

  private calculatedTop(menuHeight: number, event: MouseEvent) {
    const currentPageY = event.pageY - window.scrollY;
    if (menuHeight + currentPageY >= window.innerHeight) {
      return event.pageY - menuHeight;
    } else {
      return event.pageY;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';

.di-context-menu-container {
  z-index: 9995;
}

.di-context-menu-container ul {
  background-color: $primaryColor;
  border-radius: 4px;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 4px 0 rgba(0, 0, 0, 0.16);
  display: inline-block;
  list-style-type: none;
  max-width: 18em;
  min-width: 10em;
  overflow: hidden;
  padding: 8px 0 8px 0;
  position: absolute;
  text-align: start;
  white-space: nowrap;
}

.di-context-menu-container ul li {
  padding: 10px 16px 10px 16px;
}

.di-context-menu-container ul li:hover {
  background-color: $headerColor;
  cursor: context-menu;
}

.di-context-menu-container ul span {
  display: inline-block;
  @include regular-text;
  font-size: 14px;
  opacity: 0.8;
}
</style>
