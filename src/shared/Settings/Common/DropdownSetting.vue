<template>
  <div :class="{ 'disabled-setting': disable }" class="setting-container dropdown-setting no-gutters">
    <div v-if="enabledRevert || label != null" class="row mb-2 label justify-content-between w-100">
      <p v-if="label != null" class="m-0">{{ label }}</p>
      <RevertButton v-if="enabledRevert" @click="handleRevert" />
    </div>
    <DiDropdown
      :id="id"
      v-model="selected"
      :appendAtRoot="true"
      :class="`selection ${size}`"
      :data="options"
      :boundary="boundary"
      labelProps="displayName"
      valueProps="id"
      @selected="handleItemSelect"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { SelectOption } from '@/shared';
import { SettingSize } from '@/shared/Settings/Common/SettingSize';

@Component({})
export default class DropdownSetting extends Vue {
  @Prop({ required: true, type: String })
  private readonly id!: string;
  @Prop({ required: false, type: String })
  private readonly label!: string;
  @Prop({ required: true, default: '' })
  private readonly value!: boolean | string | number;

  @Prop({ required: true, type: Array })
  private readonly options!: SelectOption[];

  @Prop({ default: SettingSize.full })
  private readonly size!: SettingSize;

  @Prop({ required: false, type: Boolean, default: false })
  private readonly disable!: boolean;

  @Prop({ required: false, default: false })
  private readonly enabledRevert!: boolean;

  @Prop({ required: false, type: String, default: 'scrollParent' })
  private readonly boundary!: string;

  private selected = this.value;

  @Watch('value')
  handleValueChange(newValue: string) {
    this.selected = newValue;
  }

  handleItemSelect(item: SelectOption) {
    this.$emit('onChanged', item.id);
    this.$emit('onSelected', item);
  }

  handleRevert() {
    this.$emit('onRevert');
  }
}
</script>

<style lang="scss" src="./setting.style.scss"></style>
