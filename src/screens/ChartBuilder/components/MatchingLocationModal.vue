<template>
  <BModal
    id="location-normalize-modal"
    centered
    class="rounded"
    size="lg"
    :cancel-disabled="false"
    :no-close-on-backdrop="true"
    :no-close-on-esc="true"
    :hide-footer="true"
    :hide-header="true"
    v-model="isShowSync"
  >
    <div class="h-100 w-100 d-flex flex-column px-4 py-3">
      <div class="d-inline-flex w-100 justify-content-between mb-3">
        <DiTitle class="modal-title ">Matching</DiTitle>
        <img class="close-search-btn btn-ghost ic-32" src="@/assets/icon/ic_close.svg" alt="" @click="handleClose" />
      </div>
      <p>Please choose your data that matches the data of DataInsider</p>
      <LocationNormalizeTable class="h-75" :unknown-locations="unknownLocations" :normalized-location="normalizedLocation" />
      <div class="d-flex flex-row justify-content-center w-100">
        <div
          :id="genBtnId('submit-matching-location')"
          class="w-25 btn-primary align-items-center unselectable mt-4 py-2"
          style="text-align: center"
          @click="handleApplyMatching"
        >
          Apply Matching
        </div>
      </div>
    </div>
  </BModal>
</template>

<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator';
import DiButton from '@/shared/components/DiButton.vue';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import DiTitle from '@/shared/components/DiTitle.vue';
import LocationNormalizeTable from '@/screens/ChartBuilder/components/MatchingLocationTable.vue';
import { MapItem, MapResponse } from '@core/domain/Response';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import { StringUtils } from '@/utils/string.utils';

@Component({
  components: { DiTitle, DiButton, LocationNormalizeTable }
})
export default class LocationNormalizeModal extends Vue {
  @PropSync('isShow', { type: Boolean })
  isShowSync!: boolean;

  private get unknownLocations(): MapItem[] {
    const isMapResponse = MapResponse.isMapResponse(VisualizationStoreModule.previewVizResponse);
    if (isMapResponse) {
      return (
        (VisualizationStoreModule.previewVizResponse as MapResponse)?.unknownData.sort((item, nextItem) => StringUtils.compare(item.name, nextItem.name)) ?? []
      );
    }
    return [];
  }

  private get normalizedLocation(): MapItem[] {
    const isMapResponse = MapResponse.isMapResponse(VisualizationStoreModule.previewVizResponse);
    if (isMapResponse) {
      return (VisualizationStoreModule.previewVizResponse as MapResponse)?.data ?? [];
    }
    return [];
  }

  private handleClose() {
    DataBuilderModule.hideLocationNormalize();
  }

  private handleApplyMatching() {
    DataBuilderModule.applyMatchingLocation();
  }
}
</script>

<style lang="scss" scoped>
::v-deep {
  .modal-dialog {
    border-radius: 4px;
    padding: 0;
    height: 80vh !important;
    width: 40% !important;
    max-width: unset !important;
  }

  .modal-body {
    width: 100%;
    height: 80vh !important;
    padding: 0;
  }

  .visualization {
    padding: 0;
  }
}
</style>
