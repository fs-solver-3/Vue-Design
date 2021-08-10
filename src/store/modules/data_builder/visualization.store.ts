/*
 * @author: tvc12 - Thien Vi
 * @created: 11/27/20, 6:14 PM
 */

import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Status, Stores } from '@/shared';
import { VisualizationResponse } from '@core/domain/Response';
import { QuerySetting } from '@core/domain/Model/Query/QuerySetting';
import { ChartInfo, WidgetCommonData, QueryRelatedWidget, VizSetting, FormatterSetting } from '@core/domain/Model';
import { DarkTheme } from '@/themes/theme';
import { cloneDeep } from 'lodash';
import { DataModule } from '@/screens/DashboardDetail/stores/controller/DataStore';

/**
 * Store for save preview status, query and viz setting of builder
 */

@Module({ store: store, name: Stores.visualizationStore, dynamic: true, namespaced: true })
export class VisualizationStore extends VuexModule {
  readonly PREVIEW_WIDGET_ID = -1;
  readonly DEFAULT_MESSAGE_ERROR = 'There was a problem while visualization chart. Please try again';
  finalQuerySetting: QuerySetting | null = null;
  finalVizSetting: VizSetting | null = null;
  previewVizSetting: VizSetting | null = null;

  get finalWidget(): QueryRelatedWidget | null {
    if (this.finalQuerySetting) {
      const commonSetting: WidgetCommonData = this.getCommonSetting();
      const querySetting: QuerySetting = cloneDeep(this.finalQuerySetting);
      if (this.finalVizSetting) {
        querySetting.setVisualizationSetting(this.finalVizSetting);
      }
      return new ChartInfo(commonSetting, querySetting);
    } else {
      return null;
    }
  }

  get previewWidget(): QueryRelatedWidget | null {
    if (this.finalQuerySetting) {
      const commonSetting: WidgetCommonData = this.getCommonSetting();
      const querySetting: QuerySetting = cloneDeep(this.finalQuerySetting);
      if (this.previewVizSetting) {
        querySetting.setVisualizationSetting(this.previewVizSetting);
      }
      return new ChartInfo(commonSetting, querySetting);
    } else {
      return null;
    }
  }

  get hasError(): boolean {
    return this.previewStatus == Status.Error;
  }

  get errorMessage(): string {
    return DataModule.mapErrorMessage[this.PREVIEW_WIDGET_ID] || this.DEFAULT_MESSAGE_ERROR;
  }

  get isQuerySettingExisted(): boolean {
    return !this.finalQuerySetting;
  }

  get previewVizResponse(): VisualizationResponse | null {
    return DataModule.chartDataResponses[this.PREVIEW_WIDGET_ID] ?? null;
  }

  get previewStatus(): Status {
    return DataModule.statuses[this.PREVIEW_WIDGET_ID] ?? Status.Loading;
  }

  private get getCommonSetting(): () => WidgetCommonData {
    return () => {
      return {
        id: this.PREVIEW_WIDGET_ID,
        name: this.finalVizSetting?.getTitle() ?? '',
        description: this.finalVizSetting?.getSubtitle() ?? '',
        extraData: void 0,
        background: this.finalVizSetting?.getBackgroundColor() || DarkTheme.secondary,
        textColor: this.finalVizSetting?.getTextColor() || DarkTheme.textColor
      };
    };
  }

  @Mutation
  setPreviewQuerySetting(querySetting: QuerySetting) {
    this.finalQuerySetting = querySetting;
  }

  @Action
  saveVizSetting(vizSetting: VizSetting | undefined) {
    this.setFinalVizSetting(vizSetting);
    this.setPreviewVizSetting(vizSetting);
  }
  @Mutation
  setFinalVizSetting(vizSetting: VizSetting | undefined) {
    this.finalVizSetting = vizSetting ?? null;
  }
  @Mutation
  setPreviewVizSetting(vizSetting: VizSetting | undefined) {
    this.previewVizSetting = vizSetting ?? null;
  }

  @Mutation
  clearPreviewQuerySetting() {
    this.finalQuerySetting = null;
  }

  @Mutation
  reset() {
    this.finalVizSetting = null;
    this.finalQuerySetting = null;
    this.previewVizSetting = null;
  }
}

export const VisualizationStoreModule = getModule(VisualizationStore);
