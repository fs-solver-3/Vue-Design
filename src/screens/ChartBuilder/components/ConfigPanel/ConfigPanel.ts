import Vue from 'vue';
import { Drop } from 'vue-drag-drop';
import { Component, Prop } from 'vue-property-decorator';
import { ConfigType, DraggableConfig, VisualizationItemData } from '@/shared';
import vClickOutside from 'v-click-outside';
import draggable from 'vuedraggable';
import VisualizationItemListing from '../VisualizationItemListing.vue';
import ConfigDraggable from '@/screens/ChartBuilder/components/ConfigPanel/ConfigDraggable.vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import FilterDraggable from '@/screens/ChartBuilder/components/FilterPanel/FilterDraggable.vue';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';

@Component({
  directives: {
    clickOutside: vClickOutside.directive
  },
  components: {
    Drop,
    draggable,
    VisualizationItemListing,
    ConfigDraggable,
    FilterDraggable
  }
})
export default class ConfigPanel extends Vue {
  @Prop({ type: Boolean, default: false })
  private isDragging!: boolean;

  private isItemDragging = false;

  private get hasDragging(): boolean {
    return this.isDragging || this.isItemDragging;
  }

  private get itemSelected(): VisualizationItemData {
    return QueryBuilderStoreModule.itemSelected;
  }

  private async handleItemSelectedChanged(item: VisualizationItemData) {
    await DataBuilderModule.selectVisualization(item);
    await DataBuilderModule.buildQueryAndRenderVizPanel();
  }

  private get chartType(): string {
    return QueryBuilderStoreModule.chartType;
  }

  private get draggableConfigs(): DraggableConfig[] {
    return [...this.itemSelected.configPanels];
  }

  private get isShowFilter(): boolean {
    return !!this.filterConfig;
  }

  private get isShowSorting(): boolean {
    return !!this.sortingConfig;
  }

  private get filterConfig(): DraggableConfig | undefined {
    return this.itemSelected.extraPanels.find(config => config.key == ConfigType.filters);
  }

  private get sortingConfig(): DraggableConfig | undefined {
    return this.itemSelected.extraPanels.find(config => config.key == ConfigType.sorting);
  }

  private buildKey(key: string) {
    return `${this.chartType}.${key}`;
  }

  private handleItemDragging(isDragging: boolean, key: string): void {
    this.isItemDragging = isDragging;
  }
}
