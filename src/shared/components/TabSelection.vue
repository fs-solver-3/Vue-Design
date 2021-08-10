<template>
  <div :class="tabContainerClass">
    <template v-if="toComponent && !isDropdown">
      <component
        :is="toComponent"
        v-for="(item, index) in selectOptions"
        :key="index"
        :class="tabItemClass"
        :isSelected="isSelected(item)"
        :item="item"
        @onSelectItem="handleSelectItem"
      >
      </component>
    </template>
    <template v-else-if="isDropdown">
      <DiDropdown
        :id="genDropdownId(`${id}-dropdown`)"
        v-model="dropDownSelectedId"
        :append-at-root="true"
        :class="displayClass"
        :data="selectOptions"
        boundary="window"
        label-props="displayName"
        value-props="id"
      >
      </DiDropdown>
    </template>
    <template v-else>
      <div>Display filter is not displayed!</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import NormalTabItem from '@/shared/components/filters/NormalTabItem.vue';
import { Direction, SelectOption, TabFilterDisplay } from '@/shared';
import SingleChoiceItem from '@/shared/components/filters/SingleChoiceItem.vue';
import MultiChoiceItem from '@/shared/components/filters/MultiChoiceItem.vue';
import TabFilter from '@chart/TabFilter';
import { Log } from '@core/utils';

@Component({
  components: { NormalTabItem, SingleChoiceItem, MultiChoiceItem }
})
export default class TabSelection extends Vue {
  @Prop({ type: String, default: 'tab-selection' })
  id!: string;

  @Prop({ type: Array, required: true })
  selectOptions!: SelectOption[];

  @Prop({ type: String, default: TabFilterDisplay.normal })
  displayAs!: TabFilterDisplay;

  @Prop({ type: String, default: Direction.row })
  direction!: Direction;

  private selectedIds: Set<number> = new Set();

  private dropDownSelectedId: number = TabFilter.OPTION_SHOW_ALL.id;

  private get toComponent(): string | undefined {
    return TabFilter.componentsWithDisplay.get(this.displayAs);
  }

  private get isDropdown(): boolean {
    Log.debug('isDropdown', this.displayAs == TabFilterDisplay.dropDown);
    return this.displayAs == TabFilterDisplay.dropDown;
  }

  private get tabContainerClass(): string {
    switch (this.direction) {
      case Direction.row:
        return 'tab-selection-fit-content flex-row align-items-center horizontal-scroll';
      case Direction.column:
        return 'tab-selection flex-column align-items-start vertical-scroll';
      default:
        return '';
    }
  }

  private get tabItemClass(): string {
    return `${this.directionClass} ${this.displayClass}`;
  }

  private get directionClass(): string {
    switch (this.direction) {
      case Direction.row:
        return 'horizontal';
      case Direction.column:
        return 'vertical';
      default:
        return '';
    }
  }

  private get displayClass(): string {
    switch (this.displayAs) {
      case TabFilterDisplay.normal:
        return '';
      case TabFilterDisplay.singleChoice:
      case TabFilterDisplay.multiChoice:
        return 'choice';
      case TabFilterDisplay.dropDown:
        return 'dropdown-item';
      default:
        return '';
    }
  }

  mounted() {
    this.selectedIds.add(TabFilter.OPTION_SHOW_ALL.id);
    this.$forceUpdate();
  }

  private isSelected(item: SelectOption): boolean {
    const { id } = item;
    return id != undefined && this.selectedIds.has(+id);
  }

  @Watch('dropDownSelectedId')
  private onDropdownIdChanged(newId: number) {
    const selectedOption = this.selectOptions.find(option => option.id == newId);
    if (selectedOption) {
      this.handleSelectItem(selectedOption);
    }
  }

  private handleSelectItem(item: SelectOption): void {
    const selectShowAll: boolean = item.id == TabFilter.OPTION_SHOW_ALL.id;
    if (selectShowAll) {
      this.handleShowAllChanged(item);
    } else {
      const itemSelected: boolean = this.isSelected(item);
      if (itemSelected) {
        this.removeFromCurrentValues(item);
      } else {
        this.addToCurrentValues(item);
      }
    }
    const optionSelected = selectShowAll ? [] : this.selectOptions.filter(item => this.selectedIds.has(+item.id));
    this.$emit('selected', optionSelected);
    this.$forceUpdate();
  }

  private handleShowAllChanged(item: SelectOption) {
    const itemSelected: boolean = this.isSelected(item);
    if (itemSelected) {
      this.removeFromCurrentValues(item);
    } else {
      this.resetCurrentValues();
      this.addToCurrentValues(item);
    }
  }

  private resetCurrentValues() {
    this.selectedIds.clear();
  }

  private addToCurrentValues(value: SelectOption) {
    const isMultiChoice = this.displayAs === TabFilterDisplay.multiChoice;
    if (!isMultiChoice) {
      this.selectedIds.clear();
    }
    this.selectedIds.delete(TabFilter.OPTION_SHOW_ALL.id);
    this.selectedIds.add(+value.id);
  }

  private removeFromCurrentValues(value: SelectOption) {
    this.selectedIds.delete(+value.id);
  }
}
</script>

<style lang="scss" src="./tab-selection.scss" scoped></style>
