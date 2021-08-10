<template>
  <div class="visualize-preview-area position-relative">
    <div class="w-100 h-100">
      <template v-if="hasError">
        <ErrorWidget :error="errorMessage" @onRetry="handleRerender"></ErrorWidget>
      </template>
      <template v-else-if="isShowHint">
        <HintPanel :itemSelected="itemSelected"></HintPanel>
      </template>
      <template v-else>
        <div class="h-100 w-100 position-relative">
          <ChartContainer class="preview-chart-container" :isEnableFullSize="false" :isPreview="true" :metaData="metaData"></ChartContainer>
          <LocationMatchingPanel class="location-panel" v-if="canShowLocationMappingPanel"></LocationMatchingPanel>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { VisualizationItemData } from '@/shared';
import Color from 'color';
import { ThemeModule } from '@/store/modules/theme.store';
import { VisualizationStoreModule } from '@/store/modules/data_builder/visualization.store';
import { QueryBuilderStoreModule } from '@/store/modules/data_builder/query_builder.store';
import { QueryRelatedWidget } from '@core/domain/Model';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import HintPanel from '@/screens/ChartBuilder/components/VizPanel/HintPanel.vue';
import EmptyWidget from '@/screens/DashboardDetail/components/WidgetContainer/charts/ErrorDisplay/EmptyWidget.vue';
import ChartContainer from '@/screens/DashboardDetail/components/WidgetContainer/charts/ChartContainer.vue';
import { DataBuilderModule } from '@/store/modules/data_builder/data_builder.store';
import { MapResponse } from '@core/domain/Response';
import { ListUtils } from '@/utils';
import LocationMatchingPanel from '@/screens/ChartBuilder/components/VizPanel/MatchingLocationPanel.vue';
import ErrorWidget from '@/shared/components/ErrorWidget.vue';

@Component({
  components: { ErrorWidget, ChartContainer, EmptyWidget, HintPanel, StatusWidget, LocationMatchingPanel }
})
export default class PreviewPanel extends Vue {
  @Prop({ type: Boolean, default: false })
  isEditMode!: boolean;

  private get itemSelected(): VisualizationItemData {
    return QueryBuilderStoreModule.itemSelected;
  }

  // private get panelBackgroundColor(): string {
  //   const charcoalColor = new Color(ThemeModule.currentTheme.charcoal);
  //   return charcoalColor.alpha(0.3).toString();
  // }

  private get isShowHint(): boolean {
    return VisualizationStoreModule.isQuerySettingExisted;
  }

  private get metaData(): QueryRelatedWidget | null {
    return this.isEditMode ? VisualizationStoreModule.previewWidget : VisualizationStoreModule.finalWidget;
  }

  private get errorMessage(): string {
    return VisualizationStoreModule.errorMessage;
  }

  private get hasError(): boolean {
    return VisualizationStoreModule.hasError;
  }

  private handleRerender(): void {
    DataBuilderModule.buildQueryAndRenderVizPanel(true);
  }
  private get canShowLocationMappingPanel(): boolean {
    const isMapResponse = MapResponse.isMapResponse(VisualizationStoreModule.previewVizResponse);
    if (isMapResponse) {
      return !this.isEditMode && ListUtils.isNotEmpty((VisualizationStoreModule.previewVizResponse as MapResponse)?.unknownData);
    }
    return false;
  }
}
</script>
<style lang="scss" scoped>
.visualize-preview-area {
  border-radius: 4px;
  background: linear-gradient(131deg, var(--min-background-color, #3b425c) 2%, var(--max-background-color, #212638) 90%);
  padding: 24px;
}

.error-area {
  .hint-panel {
    height: 100%;
  }
}
.preview-chart-container {
  //height: calc(100%- 48px) !important;
  //::v-deep {
  //  .preview-container {
  //    height: calc(100%- 48px) !important;
  //  }
  //}
}
.location-panel {
  position: absolute;
  bottom: 24px;
  width: 100%;
}
</style>
