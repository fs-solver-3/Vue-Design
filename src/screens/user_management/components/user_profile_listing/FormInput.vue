<template>
  <div class="input-box">
    <div v-if="!!label">{{ label }}</div>
    <input v-model="inputValue" autocomplete="off" :class="{ warning: isError }" :placeholder="placeholder" type="text" />
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class FormInput extends Vue {
  @Prop({ required: false, type: String })
  defaultInputValue!: string;

  inputValue = this.defaultInputValue || '';

  @Prop({ required: false })
  isError!: boolean;

  @Prop({ required: false })
  label!: string;

  @Prop({ required: true })
  placeholder!: string;

  @Watch('inputValue')
  handleChangeInputValue(newInputValue: string) {
    this.$emit('handleChangeInputValue', newInputValue);
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';

.input-box {
  padding: 0 24px;
  width: 100%;

  .warning-text {
    color: var(--danger);
  }

  .warning {
    border: 1px solid var(--danger);
  }

  > input {
    @include regular-text-14();
    height: 34px;
    background-color: #333646;
    padding: 0 16px;
    border-radius: 4px;
    outline: none;
    border: none;
    width: 100%;
  }
}

.input-box + .input-box {
  margin-top: 16px;
}
</style>
