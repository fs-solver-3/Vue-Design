<template>
  <div class="d-inline-block h-100 w-100">
    <div v-if="hintChart" class="d-flex flex-column hint-area text-left">
      <slot name="error"></slot>
      <div class="d-inline-flex align-items-start text-left">
        <img class="icon-idea" src="@/assets/icon/idea.svg" alt="idea" />
        <div class="text-area">
          <div>How to create a {{ hintChart.name }} Chart?</div>
          <div class="hint-text">
            <div v-for="(hintText, index) in hintChart.pages[0].hintTexts" :key="index">
              {{ hintText }}
            </div>
          </div>
        </div>
      </div>
      <div class="hint-image align-self-center">
        <img :src="require(`@/assets/icon/${hintChart.pages[0].image}`)" alt="hint-icon" />
      </div>
    </div>
    <div class="d-flex flex-column default-hint align-items-center h-100 justify-content-center" v-else>
      <slot name="error"></slot>
      <img class="unselectable" :src="require(`@/assets/icon/charts/${itemSelected.src}`)" alt="icon" />
      <div class="description">
        <img class="btn-ghost-alter" src="@/assets/icon/ic_help.svg" alt="help" />
        <span> Learn to create {{ itemSelected.title }} Chart <strong class="btn-ghost-alter">here</strong>. </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { VisualizationItemData } from '@/shared';
import { HintChartData, HintCharts } from '@/shared/constants/hint_chart_data';

@Component
export default class HintPanel extends Vue {
  @Prop({ required: true })
  private itemSelected!: VisualizationItemData;

  private get hintChart(): HintChartData {
    return HintCharts[this.itemSelected.type];
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin.scss';
@import '~bootstrap/scss/bootstrap-grid';

.hint-area {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 16px;
  width: 100%;
  height: 100%;

  img[class~='icon-idea'] {
    width: 16px;
    height: 16px;
  }

  .text-area {
    margin-left: 8px;
    @include semi-bold-14();

    > .hint-text {
      margin-top: 16px;
      @include regular-text-14();
      opacity: 0.5;
    }
  }

  .hint-image {
    margin-top: auto;
    margin-bottom: auto;

    > img {
      width: 511px;
      height: 204px;

      @media screen and (min-width: 2048px) {
        width: 668px;
        height: 266px;
      }

      @include media-breakpoint-down(lg) {
        width: 387px;
        height: 153px;
      }
    }
  }
}

.default-hint {
  background-color: rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100%;

  > img {
    @include icon-128();
  }

  .description {
    margin-top: 16px;
    @include regular-text();
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: 0.27px;

    > img {
      padding: 4px;
      box-sizing: content-box;
    }

    strong {
      text-decoration: underline;
    }
  }
}
</style>
