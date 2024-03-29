<template>
  <div class="data-bar-setting">
    <div class="data-bar-setting-bar min-max">
      <ValueColorPicker id="min-data-bar" ref="min" :showColorPicker="false" :value.sync="clonedValue.min" firstOptionLabel="Lowest value" title="Minimum" />
      <ValueColorPicker id="max-data-bar" ref="max" :showColorPicker="false" :value.sync="clonedValue.max" firstOptionLabel="Highest value" title="Minimum" />
    </div>
    <div class="data-bar-setting-bar">
      <DropdownSetting
        id="data-bar-direction"
        :options="directionOptions"
        :value="clonedValue.direction"
        label="Bar direction"
        @onChanged="handleBarDirectionChange"
      />
      <ColorSetting
        id="axis-color"
        :defaultColor="defaultColor.axisColor"
        :value="clonedValue.axisColor"
        label="Axis"
        size="small"
        @onChanged="handleAxisChanged"
      />
    </div>
    <div class="data-bar-setting-bar">
      <ColorSetting
        id="negative-bar-color"
        :defaultColor="defaultColor.negativeColor"
        :value="clonedValue.negativeColor"
        label="Negative bar"
        size="small"
        @onChanged="handleNegativeChanged"
      />
      <ColorSetting
        id="positive-bar-color"
        :defaultColor="defaultColor.positiveColor"
        :value="clonedValue.positiveColor"
        label="Positive bar"
        size="small"
        @onChanged="handlePositiveChanged"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import ValueColorPicker from '@/shared/Settings/Common/ConditionalFormatting/ValueColorPicker.vue';
import { DataBarFormatting, ValueColorFormattingType } from '@core/domain';
import { JsonUtils } from '@core/utils';
import { cloneDeep } from 'lodash';
import { SelectOption } from '@/shared';
import ColorPicker from '@/shared/components/ColorPicker.vue';

@Component({
  components: { ColorPicker, ValueColorPicker }
})
export default class DataBarSetting extends Vue {
  @Prop({ required: true })
  private readonly value?: DataBarFormatting;

  @Ref()
  private readonly min?: ValueColorPicker;

  @Ref()
  private readonly max?: ValueColorPicker;

  private readonly defaultColor = {
    axisColor: '#E6E6E6',
    positiveColor: '#6289d2',
    negativeColor: '#d8bc71'
  };

  private readonly directionOptions: SelectOption[] = [
    {
      displayName: 'Left to right',
      id: 'left'
    },
    {
      displayName: 'Right to left',
      id: 'right'
    }
  ];

  private clonedValue: DataBarFormatting = {};

  static getDefaultDataDar(): DataBarFormatting {
    return {
      enabled: true,
      max: {
        color: '',
        enabled: true,
        value: '',
        type: ValueColorFormattingType.Default
      },
      min: {
        type: ValueColorFormattingType.Default,
        value: '',
        enabled: true,
        color: ''
      },
      direction: 'left',
      axisColor: '#E6E6E6',
      negativeColor: '#d8bc71',
      positiveColor: '#6289d2'
    };
  }

  created() {
    this.initData(this.value);
  }

  validate(): boolean {
    const isMinColorError = this.min?.inputValueError ?? true;
    const isMaxColorError = this.max?.inputValueError ?? true;
    return !(isMinColorError || isMaxColorError);
  }

  getValue(): DataBarFormatting {
    return cloneDeep(this.clonedValue);
  }

  private initData(value: DataBarFormatting | undefined) {
    this.clonedValue = JsonUtils.mergeDeep(DataBarSetting.getDefaultDataDar(), cloneDeep(value) ?? {});
  }

  private handleBarDirectionChange(value: 'left' | 'right') {
    this.clonedValue.direction = value;
  }

  private handleAxisChanged(newColor: string) {
    this.clonedValue.axisColor = newColor;
  }

  private handlePositiveChanged(newColor: string) {
    this.clonedValue.positiveColor = newColor;
  }

  private handleNegativeChanged(newColor: string) {
    this.clonedValue.negativeColor = newColor;
  }
}
</script>

<style lang="scss">
.data-bar-setting {
  > div.data-bar-setting-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    > div {
      flex: 1;
      max-width: 150px;
    }
  }

  > div.data-bar-setting-bar + div.data-bar-setting-bar {
    margin-top: 16px;
  }

  > div.min-max {
    > div {
      .color-picker-panel {
        .picker-type-select {
          margin-right: unset;
          width: unset;
        }
      }

      .input-value-color {
        width: unset;
      }
    }
  }
}
</style>
