<template>
  <VisualizeSelectionModal
    :isShow.sync="isShowSync"
    title="Add DataSource"
    sub-title="Select DataSource Type"
    :all-items="allItems"
    :no-close-on-esc="false"
    :no-close-on-backdrop="false"
    class="visualization-panel mb-3"
    @onItemSelected="handleItemSelected"
  >
    <template #default="{item, index, onClickItem}">
      <DataSourceItem :item="item" :key="index" @onClickItem="onClickItem"> </DataSourceItem>
    </template>
  </VisualizeSelectionModal>
</template>

<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator';
import { ALL_DATASOURCE } from '@/screens/DataIngestion/constants/datasource.constants';
import VisualizeSelectionModal from '@/screens/ChartBuilder/components/VisualizeSelectionModal.vue';
import { ItemData, VisualizationItemData } from '@/shared';
import DataSourceItem from '@/screens/DataIngestion/components/DataSourceItem.vue';

@Component({
  components: { DataSourceItem, VisualizeSelectionModal }
})
export default class DataSourceTypeSelection extends Vue {
  @PropSync('isShow', { type: Boolean })
  isShowSync!: boolean;

  private readonly allItems: ItemData[] = ALL_DATASOURCE;

  private handleItemSelected(selectedDataSource: VisualizationItemData) {
    this.$emit('onDataSourceTypeSelected', selectedDataSource);
  }
}
</script>

<style lang="scss" scoped></style>
