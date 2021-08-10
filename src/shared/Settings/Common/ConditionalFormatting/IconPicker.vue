<template>
  <div class="icon-picker">
    <div :id="id" class="icon-picker-preview" tabindex="-1" @click.prevent="toggleShowPicker">
      <div class="unselectable" v-html="value"></div>
    </div>
    <BPopover :show.sync="isPickerShowing" :id="`${id}-popover`" :target="id" container="body" custom-class="icon-picker-popover" triggers="blur">
      <div class="icon-listing">
        <template v-for="(icon, index) in Icons">
          <div class="unselectable" :key="index" v-html="icon" @click="emitValueChange(icon)"></div>
        </template>
      </div>
    </BPopover>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { RandomUtils } from '@/utils';
import { FormattingOptions } from '@/shared/Settings/Common/ConditionalFormatting/FormattingOptions';

@Component
export default class IconPicker extends Vue {
  private readonly Icons: string[] = FormattingOptions.getIcons();

  @Prop({ required: true, type: String, default: '' })
  private readonly value!: string;

  @Prop({ required: false, type: String, default: () => RandomUtils.nextString() })
  private readonly id!: string;

  private isPickerShowing = false;

  @Emit('change')
  private emitValueChange(newValue: string) {
    return newValue;
  }

  private toggleShowPicker() {
    this.isPickerShowing = !this.isPickerShowing;
  }
}
</script>

<style lang="scss">
.icon-picker-preview {
  background-color: var(--secondary);
  border-radius: 4px;
  cursor: pointer;
  height: 34px;
  padding: 8px;
  width: 34px;

  > div {
    height: 100%;
    line-height: normal;
    width: 100%;
  }
}

.icon-picker-popover {
  background: none;
  border: none;
  max-height: 200px;
  max-width: 300px;
  overflow: scroll;

  .arrow {
    display: none;
  }

  .popover-body {
    background: var(--secondary);
    border-radius: 4px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 4px 0 rgba(0, 0, 0, 0.16);

    > .icon-listing {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      > div {
        cursor: pointer;
        font-size: 20px;
        line-height: normal;
        padding: 4px;
        width: 24px;
        height: 24px;
        box-sizing: content-box;
        text-align: center;
        color: white;
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        //height: 24px;
        //width: 24px;
      }
    }
  }
}
</style>
