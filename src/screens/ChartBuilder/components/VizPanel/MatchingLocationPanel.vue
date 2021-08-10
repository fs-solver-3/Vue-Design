<template>
  <div class="location-panel-container">
    <p class="mb-0 pt-1">{{ countUnknownLocation }} unknown locations found</p>
    <div :id="genBtnId('matching-location')" class="btn-primary align-middle unselectable px-3 pt-1 ml-2" @click="handleMatching">
      Matching
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DiButton from '@/shared/components/DiButton.vue';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import { MapResponse } from '@core/domain/Response';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import { ListUtils } from '@/utils';

@Component({
  components: { DiButton }
})
export default class LocationMatchingPanel extends Vue {
  private get countUnknownLocation(): number {
    const isMapResponse = MapResponse.isMapResponse(VisualizationStoreModule.previewVizResponse);
    if (isMapResponse) {
      return (VisualizationStoreModule.previewVizResponse as MapResponse)?.unknownData.length ?? 0;
    }
    return 0;
  }

  private handleMatching() {
    DataBuilderModule.showLocationMatchingModal();
  }
}
</script>

<style lang="scss" scoped>
.location-panel-container {
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
