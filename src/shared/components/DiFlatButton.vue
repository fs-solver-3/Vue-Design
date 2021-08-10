<template>
  <div :id="id" :style="btnStyle" tabindex="-1" class="di-flat-button d-flex flex-row align-items-center btn-ghost" @click="handleClick">
    <slot></slot>
    <div :class="fullStyle" class="title unselectable">{{ title || placeholder }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DiFlatButton extends Vue {
  @Prop({ default: '', type: String })
  title?: string;

  @Prop({ default: '', type: String })
  placeholder!: string;

  @Prop({ default: '', type: String })
  textStyle?: string;

  @Prop({ default: false, type: Boolean })
  isDisable!: boolean;

  @Prop({ required: true, type: String })
  id!: string;

  get fullStyle(): string {
    return !this.textStyle ? 'regular-text-14 flex-shrink-1 ' : 'flex-shrink-1 ' + this.textStyle;
  }

  private get btnStyle(): CSSStyleDeclaration {
    if (this.isDisable) {
      return {
        opacity: 0.5,
        pointerEvents: 'none'
      } as any;
    } else {
      return {} as any;
    }
  }

  @Emit('click')
  private handleClick(event: MouseEvent): MouseEvent {
    return event;
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.regular-text-14 {
  // @include regular-text;
  line-height: unset;
  padding-bottom: 0;
  padding-left: 6px;
  padding-top: 0;
  text-align: center;
  white-space: nowrap;
  width: 100%;
}

div {
  cursor: pointer;
  padding: 8px;
}

.di-flat-button {
  .title {
    opacity: 1;
  }

  &:hover {
    .title {
      opacity: 1;
    }
  }
}
</style>
