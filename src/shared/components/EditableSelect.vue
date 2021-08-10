<template>
  <div :style="autocompleteBackgroundColor" class="autocomplete">
    <input :id="id" v-model="inputValue" autocomplete="off" maxlength="2" type="search" @blur="hide" @focus="showAutoComplete" />
    <b-popover :show.sync="isShowAutoComplete" :target="id" custom-class="popover-editable" placement="bottom" triggers="blur">
      <template>
        <div class="autocomplete-items" @mousedown="onMousedown">
          <div v-for="(v, i) in items" :key="i" @click="setValue(v)">{{ v.display }}</div>
        </div>
      </template>
    </b-popover>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { RandomUtils } from '@/utils';

@Component
export default class EditableSelect extends Vue {
  @Prop({ required: true, default: 20 })
  defaultValue!: number;

  @Prop({ required: true })
  items!: any;

  @Prop({ required: true })
  backgroundColor!: string;

  currentValue: number;
  isShowAutoComplete: boolean;
  mousedown: boolean;
  timeout: number;

  readonly id = `editable_select__${RandomUtils.nextInt()}`;

  constructor() {
    super();
    this.currentValue = 0;
    this.timeout = 0;
    this.isShowAutoComplete = false;
    this.mousedown = false;
  }

  get autocompleteBackgroundColor() {
    return {
      '--autocomplete-background-color': this.backgroundColor
    };
  }

  get inputValue() {
    return this.currentValue;
  }

  set inputValue(value) {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => {
      this.currentValue = value;
    }, 1000);
  }

  @Watch('defaultValue', { immediate: true, deep: true })
  defaultValueChanged(): void {
    this.currentValue = this.defaultValue;
  }

  @Watch('currentValue')
  currentValueChanged(): void {
    if (!this.currentValue) this.currentValue = 1;
    this.$emit('selectedValue', this.currentValue);
  }

  onMousedown() {
    this.mousedown = true;
  }

  showAutoComplete() {
    this.isShowAutoComplete = true;
  }

  hide() {
    if (!this.mousedown) {
      this.isShowAutoComplete = false;
    }
  }

  setValue(seletedItem: any) {
    this.isShowAutoComplete = false;
    this.currentValue = seletedItem.value;
    this.mousedown = false;
    this.$emit('selectedValue', this.currentValue);
  }
}
</script>

<style lang="scss" scoped>
@import '~@/shared/components/charts/CustomTable/default-table.style';

.autocomplete {
  display: inline-block;
  position: relative;

  input {
    background-color: var(--autocomplete-background-color, $default-background-color);
    border: none;
    color: var(--text-color, $default-text-color);
    margin: 0;
    text-align: center;
    text-decoration: underline;
  }
}

.popover-editable {
  text-align: center;

  .autocomplete-items {
    border-radius: 4px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 4px 0 rgba(0, 0, 0, 0.16);
    // FIXME: --text-color not available in popover
    color: var(--text-color, $default-text-color);

    div {
      background-color: var(--primary);
      cursor: pointer;
      padding: 10px;

      &:last-child {
        border-bottom: unset;
      }

      &:hover {
        background-color: #000;
      }
    }
  }

  .autocomplete-active {
    background-color: #000 !important;
    color: var(--white);
  }
}

::v-deep {
  .arrow {
    display: none;
  }

  .popover-body {
    padding: 0px !important;
  }
}
</style>
