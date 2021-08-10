<template>
  <div class="setting-container dropdown-setting no-gutters" v-click-outside="handleClickOutside" :class="{ 'disabled-setting': disable }">
    <p v-if="label != null" class="label text-break mb-2">{{ label }}</p>
    <b-input-group class="form-control">
      <b-form-input
        :id="genInputId(`${id}`)"
        v-model="textInput"
        :type="type"
        autocomplete="off"
        @blur="handleUnFocusInput"
        @focus="handleFocusInput"
        @keydown.enter="handleSave"
        ref="input"
        :placeholder="placeholder"
      />
      <!--      <b-input-group-append v-show="isShowSaving">-->
      <!--        <img :id="genBtnId(`${settingItemSynced.key}-cancel`)" src="@/assets/icon/ic-close-16.svg" alt="Cancel" @click="handleCancel" />-->
      <!--        <img :id="genBtnId(`${settingItemSynced.key}-save`)" src="@/assets/icon/ic-16-save.svg" alt="Save" @click="handleSave" />-->
      <!--      </b-input-group-append>-->
    </b-input-group>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { SettingSize } from '@/shared/Settings/Common/SettingSize';

export enum InputType {
  Text = 'text',
  Number = 'number'
}

@Component({})
export default class InputSetting extends Vue {
  @Prop({ required: true, type: String })
  private readonly id!: string;
  @Prop({ required: false, type: String })
  private readonly label!: string;
  @Prop({ required: true })
  private readonly value!: string;

  @Prop({ default: SettingSize.full })
  private readonly size!: SettingSize;

  @Prop({ required: false, type: Boolean, default: false })
  private readonly disable!: boolean;

  @Prop({ required: false, type: String, default: '' })
  private readonly placeholder!: string;

  @Prop({ required: false, default: InputType.Text })
  private readonly type!: InputType;

  @Ref()
  private input!: any;

  private textInput = this.value ?? '';

  setTextInput(value: string) {
    this.textInput = value;
  }

  @Watch('value')
  private onValueChanged(newValue: string): void {
    if (this.textInput !== newValue) {
      this.textInput = newValue;
    }
  }

  private isShowSaving = false;

  private handleSave() {
    this.input?.blur();
    this.$emit('onChanged', this.textInput);
  }

  private handleFocusInput() {
    this.isShowSaving = true;
  }
  private handleUnFocusInput() {
    this.$emit('onChanged', this.textInput);
  }

  private handleClickOutside() {
    if (this.isShowSaving) {
      this.isShowSaving = false;
    }
  }
}
</script>

<style lang="scss" src="./setting.style.scss"></style>
