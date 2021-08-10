<template>
  <div :id="genBtnId(`${id}`)" :class="{ 'disabled-setting': disable }" class="setting-container toggle toggle-setting">
    <div class="custom-control custom-switch" @click.prevent="toggleButton">
      <input :id="`toggle-${id}`" v-model="value" class="custom-control-input" type="checkbox" />
      <label :for="`toggle-${id}`" class="custom-control-label"> </label>
    </div>
    <p :title="label" class="label text-break">{{ label }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class ToggleSetting extends Vue {
  @Prop({ required: true, type: String })
  private readonly id!: string;
  @Prop({ required: true, type: String })
  private readonly label!: string;
  @Prop({ required: true, type: Boolean })
  private value!: boolean;
  @Prop({ required: false, type: Boolean, default: false })
  private readonly disable!: boolean;

  toggleButton() {
    this.value = !this.value;
    this.$emit('onChanged', this.value);
  }
}
</script>

<style lang="scss">
@import '~@/themes/scss/mixin.scss';
@import 'setting.style';

.toggle-setting {
  .custom-control-label::after {
    cursor: pointer;
    top: 0.3rem;
    left: -2.4rem;
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 0.35rem;
  }

  .custom-control-input:checked ~ .custom-control-label::after {
    background-size: cover;
    background-color: var(--primary);
    cursor: pointer;
  }

  .custom-control-label {
    font-weight: bold;
    padding-left: 4px;
    letter-spacing: 0.27px;
    cursor: pointer;
  }
}
</style>
