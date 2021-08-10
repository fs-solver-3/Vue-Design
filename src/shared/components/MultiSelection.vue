<template>
  <b-form-checkbox-group stacked v-model="selectedColumns">
    <RecycleScroller
      :id="id"
      :items="options"
      :item-size="40"
      :key-field="keyField"
      :buffer="30"
      :prerender="10"
      v-slot="{ item }"
      ref="scroller"
      @scroll.native="onScroll"
    >
      <b-form-checkbox :key="item.value" :value="item.value" :disabled="item.disabled">
        {{ item.text }}
      </b-form-checkbox>
    </RecycleScroller>
  </b-form-checkbox-group>
</template>

<script lang="ts">
import { Component, Emit, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { CheckboxGroupOption } from '../interfaces';

@Component
export default class MultiSelection extends Vue {
  @Prop({ required: true })
  options!: CheckboxGroupOption[];

  @Prop({ required: true })
  model!: string[];

  @Prop({ required: true })
  id!: string;

  @Prop({ required: false, type: String, default: 'value' })
  private readonly keyField!: string;

  selectedColumns: string[];

  @Ref()
  scroller!: any;

  constructor() {
    super();
    this.selectedColumns = this.model;
  }

  @Watch('model', { immediate: true, deep: true })
  modelChanged() {
    this.selectedColumns = this.model;
  }

  @Watch('selectedColumns')
  selectedColumnsChanged() {
    this.$emit('selectedColumnsChanged', this.selectedColumns);
  }

  @Emit('onScroll')
  private onScroll() {
    const currentHeight = (this.scroller.$el as HTMLElement).offsetHeight + this.scroller.$el.scrollTop;
    const scrollHeight = this.scroller.$el.scrollHeight;
    return currentHeight / scrollHeight;
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

::v-deep {
  .custom-control {
    margin: 16px 0px;
  }

  input[type='checkbox'],
  input[type='checkbox'] + label {
    cursor: pointer;
  }

  .custom-control:last-child {
    margin-bottom: 20px;
  }

  .custom-control-label::before {
    background-color: var(--primary) !important;
    border: 1px solid var(--neutral) !important;
    border-radius: 2px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  }

  .custom-control-input:checked ~ .custom-control-label::after {
    border: 1px solid var(--accent) !important;
    border-radius: 2px;
    background-image: url('~@/assets/icon/ic-16-check.svg');
    background-size: cover;
  }

  .custom-control-input:checked ~ .custom-control-label::before {
    border: none !important;
  }

  .custom-control-label {
    @include regular-text;
    font-family: Barlow !important;
    opacity: 0.8 !important;
    font-size: 16px !important;
    letter-spacing: 0.27px !important;
    color: var(--white) !important;
  }
}
</style>
