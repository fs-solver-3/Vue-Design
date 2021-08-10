<template>
  <PanelHeader ref="panel" header="Tab controls" target-id="data-point-tab">
    <div class="data-point-tab">
      <DropdownSetting
        id="direction-tab"
        :options="directionOptions"
        :value="direction"
        class="mb-3"
        label="Position"
        size="full"
        @onChanged="handleDirectionChanged"
      />
      <DropdownSetting id="display-tab" :options="displayOptions" :value="displayAs" class="mb-3" label="Type" size="full" @onChanged="handleDisplayChanged" />
      <DropdownSetting id="tab-align" :options="alignOptions" :value="tabAlign" class="mr-2 mb-3" label="Align" size="full" @onChanged="handleAlignChanged" />
      <div class="row-config-container">
        <ColorSetting
          id="de-active-color"
          :default-color="defaultSetting.deactivateColor"
          :value="deactivateColor"
          label="Background inactive"
          size="half"
          style="margin-right: 12px"
          @onChanged="handleDeActivateColorChanged"
        />
        <ColorSetting
          id="active-color"
          :default-color="defaultSetting.activeColor"
          :value="activeColor"
          label="Background active"
          size="half"
          @onChanged="handleActivateColorChanged"
        />
      </div>
      <RevertButton class="mb-3 pr-3" style="text-align: right" @click="handleRevert" />
    </div>
  </PanelHeader>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TabVizData } from '@core/domain';
import { Direction, SelectOption, TabFilterDisplay } from '@/shared';
import PanelHeader from '@/screens/ChartBuilder/components/VizPanel/SettingPanel(2)/components/PanelHeader.vue';
import { SettingKey } from '@/screens/ChartBuilder/SettingBloc';
import { FlexAlignOptions } from '@/shared/Settings/Common/Options/AlignOptions';

@Component({ components: { PanelHeader } })
export default class TabFilterControlTab extends Vue {
  @Prop({ required: false, type: Object })
  setting?: TabVizData;
  private readonly defaultSetting = {
    activeColor: '#597fff',
    deactivateColor: '#4a506a',
    direction: 'row',
    displayAs: 'normal',
    align: 'center'
  };

  private readonly alignOptions = FlexAlignOptions;

  private get direction(): string {
    return this.setting?.direction ?? 'row';
  }

  private get displayAs(): string {
    return this.setting?.displayAs ?? TabFilterDisplay.normal;
  }

  private get activeColor(): string {
    return this.setting?.activeColor ?? '#597fff';
  }

  private get deactivateColor(): string {
    return this.setting?.deactivateColor ?? '#4a506a';
  }

  private get directionOptions(): SelectOption[] {
    return [
      {
        displayName: 'Row',
        id: Direction.row
      },
      {
        displayName: 'Column',
        id: Direction.column
      }
    ];
  }

  private get tabAlign(): string {
    return this.setting?.align ?? this.defaultSetting.align;
  }

  private get displayOptions(): SelectOption[] {
    return [
      {
        displayName: 'Button',
        id: TabFilterDisplay.normal
      },
      {
        displayName: 'Single choice',
        id: TabFilterDisplay.singleChoice
      },
      {
        displayName: 'Multi choice',
        id: TabFilterDisplay.multiChoice
      },
      {
        displayName: 'Dropdown',
        id: TabFilterDisplay.dropDown
      }
    ];
  }

  private handleDirectionChanged(newDirectory: string) {
    return this.$emit('onChanged', 'direction', newDirectory);
  }

  private handleDisplayChanged(newDisplay: string) {
    return this.$emit('onChanged', 'displayAs', newDisplay);
  }

  private handleActivateColorChanged(newColor: string) {
    return this.$emit('onChanged', 'activeColor', newColor);
  }

  private handleDeActivateColorChanged(newColor: string) {
    return this.$emit('onChanged', 'deactivateColor', newColor);
  }

  private handleAlignChanged(newAlign: string) {
    return this.$emit('onChanged', 'align', newAlign);
  }

  private handleRevert() {
    const settingAsMap: Map<SettingKey, boolean | string | number> = new Map();
    settingAsMap.set('direction', this.defaultSetting.direction);
    settingAsMap.set('displayAs', this.defaultSetting.displayAs);
    settingAsMap.set('activeColor', this.defaultSetting.activeColor);
    settingAsMap.set('deactivateColor', this.defaultSetting.deactivateColor);
    this.$emit('onMultipleChanged', settingAsMap);
  }
}
</script>

<style lang="scss" scoped></style>
