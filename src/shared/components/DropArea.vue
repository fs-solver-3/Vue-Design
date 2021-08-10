<template>
  <div class="drop-area">
    <div v-if="showTitle" class="d-flex flex-row header align-items-center">
      <div v-once class="title unselectable">{{ title }}</div>
      <div v-if="isOptional" v-once class="subtitle unselectable">(optional)</div>
      <img v-show="showHelpIcon" alt="help" class="ml-auto btn-ghost-alter" src="@/assets/icon/ic_help.svg" />
    </div>
    <drop :class="{ active: isDragging }" @drop="handleDrop" class="body">
      <template v-if="$slots['drop-area']">
        <slot name="drop-area"></slot>
      </template>
      <template v-else>
        <slot name="items"></slot>
        <slot v-if="showPlaceHolder" name="default">
          <div class="tutorial-drop">
            <div v-once class="unselectable">{{ placeholder }}</div>
          </div>
        </slot>
      </template>
    </drop>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Drop } from 'vue-drag-drop';
import { DataFlavor } from '@/shared';
import { Log } from '@core/utils';
import draggable from 'vuedraggable';

@Component({
  components: { Drop, draggable }
})
export default class DropArea extends Vue {
  @Prop({ type: String, required: false, default: '' })
  private title!: string;

  @Prop({ required: true, type: String })
  private placeholder!: string;

  @Prop({ required: false, type: Boolean, default: true })
  private showTitle!: boolean;

  @Prop({ required: false, type: Boolean, default: true })
  private showHelpIcon!: boolean;

  @Prop({ required: false, type: Boolean, default: true })
  private allowDrop!: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  private showPlaceHolder!: boolean;

  @Prop({ required: false, type: Boolean, default: false })
  private isDragging!: boolean;

  @Prop({ type: Boolean, default: false })
  private isOptional!: boolean;

  private handleAdd(data: any): void {
    //
    Log.debug('add::', data);
  }

  private handleDrop(data: DataFlavor<any>, event: MouseEvent): void {
    Log.debug('DropArea::handleDrop::');
    event.stopPropagation();
    if (this.allowDrop && data && data.node) {
      this.$emit('onDrop', data);
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.drop-area {
  .header {
    .title {
      @include semi-bold-text();
      font-size: 14px;
      letter-spacing: 0.6px;
    }

    .subtitle {
      margin-left: 5px;
      opacity: 0.5;
    }

    .ic-help {
      height: 16px;
      width: 16px;
    }
  }

  .body {
    border: dashed 1.5px rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    //padding: 8px;
    position: relative;

    ::v-deep {
      .tutorial-drop {
        font-size: 14px;

        @include regular-text();
        letter-spacing: 0.2px;
        padding: 16px;
      }
    }
  }

  .body.active {
    border: dashed 1.5px var(--accent);
  }

  .header + .body {
    margin-top: 16px;
  }
}
</style>
