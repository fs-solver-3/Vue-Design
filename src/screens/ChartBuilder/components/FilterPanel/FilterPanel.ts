import { ConfigType, DraggableConfig, OnlyVerticalScrollConfigs, VisualizationItemData } from '@/shared';
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import DiTab from '@/shared/components/DiTab.vue';
import FilterDraggable from '@/screens/ChartBuilder/components/FilterPanel/FilterDraggable.vue';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import ConfigDraggable from '@/screens/ChartBuilder/components/ConfigPanel/ConfigDraggable.vue';

@Component({
  components: {
    DiTab,
    FilterDraggable,
    ConfigDraggable
  }
})
export default class FilterPanel extends Vue {
  private scrollOptions = OnlyVerticalScrollConfigs;

  @Prop({ type: Boolean, default: false })
  private isDragging!: boolean;

  @Ref()
  private menu!: any;

  private get itemSelected(): VisualizationItemData {
    return QueryBuilderStoreModule.itemSelected;
  }

  private isFilter(item: DraggableConfig): boolean {
    return item.key == ConfigType.filters;
  }

  private isSorting(item: DraggableConfig): boolean {
    return item.key == ConfigType.sorting;
  }
}
