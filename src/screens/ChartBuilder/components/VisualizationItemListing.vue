<template>
  <div class="select-type-chart-container">
    <div class="d-flex justify-content-between align-items-center w-100 title-panel">
      <div class="title unselectable">Type</div>

      <div class="ml5"></div>
      <button type="button" class="btn btn-see-more btn-ghost ml-auto" id="btnShowListVizItem" @click="handleShowSelectedVizItem">
        <div class="btn-title">View all</div>
        <img src="@/assets/icon/ic-16-arrow-down.svg" alt="More Option" />
      </button>
    </div>

    <div class="menu-select-scroll-container" style="overflow: hidden">
      <vuescroll ref="viewAllScroll">
        <div class=" d-flex flex-row">
          <VisualizationItem
            class="menu-select-scroll-item"
            v-for="(item, index) in allItemsInScroll"
            :key="index"
            type="mini"
            :item="item"
            :isSelected="isSelected(item)"
            @onClickItem="handleSelectItem"
          >
          </VisualizationItem>
        </div>
      </vuescroll>
    </div>
    <BPopover target="btnShowListVizItem" :show.sync="isShowSelectVizTypePanel" custom-class="popover-custom" triggers="click blur" placement="bottomLeft">
      <div class="dropdown-viz-items-popover-container">
        <vuescroll>
          <div class="dropdown-viz-items-scroll-container">
            <VisualizationItem
              class="dropdown-viz-item"
              v-for="(item, index) in allItems"
              :key="index"
              type="default"
              :item="item"
              :isSelected="isSelected(item)"
              @onClickItem="handleSelectItem"
            >
            </VisualizationItem>
          </div>
        </vuescroll>
      </div>
    </BPopover>
  </div>
</template>

<script lang="ts">
import { Component, PropSync, Ref, Vue, Watch } from 'vue-property-decorator';
import { DataBuilderConstantsV35, VisualizationItemData } from '@/shared';
import VisualizationItem from '@/screens/ChartBuilder/components/VisualizationItem.vue';

@Component({
  components: { VisualizationItem }
})
export default class VisualizationItemListing extends Vue {
  private allItems: VisualizationItemData[] = [...DataBuilderConstantsV35.ALL_CHARTS, ...DataBuilderConstantsV35.ALL_FILTERS];
  private allItemsInScroll = [...this.allItems];

  private isShowSelectVizTypePanel = false;

  @PropSync('itemSelected', { required: true })
  private itemSelectedSync!: VisualizationItemData;

  @Ref()
  readonly viewAllScroll!: any;

  @Watch('itemSelected', { immediate: true })
  handleOnItemSelectedChanged(itemSelected: VisualizationItemData) {
    this.$nextTick(() => {
      // this.viewAllScroll.scrollIntoView(`#${itemSelected.type}`, 300);
      const idItemSelected = document.getElementById(itemSelected.type);
      idItemSelected?.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'smooth'
      });
      // this.viewAllScroll.scrollTo(
      //   {
      //     x: 5 * 37,
      //   },
      //   200
      // );
    });
  }

  handleShowSelectedVizItem() {
    this.isShowSelectVizTypePanel = !this.isShowSelectVizTypePanel;
  }

  private handleSelectItem(icon: VisualizationItemData) {
    this.isShowSelectVizTypePanel = false;
    this.itemSelectedSync = icon;
  }

  private isSelected(item: VisualizationItemData): boolean {
    return this.itemSelectedSync?.type === item.type;
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

.ml5 {
  margin-left: 5px;
}

.select-type-chart-container {
  display: flex;
  width: 100%;
  align-items: center;
  flex-wrap: wrap;

  .title-panel {
    margin-bottom: 10px;
  }

  .title {
    justify-content: flex-start;
    padding-right: 5px;
    font-weight: 600;
  }

  .selected-item-container {
    margin-right: 5px;
    justify-content: flex-start;
  }

  .menu-select-scroll-container {
    margin-left: auto;
    .menu-select-scroll-item:not(:last-child) {
      padding-right: 5px;
    }
  }

  .btn-see-more {
    display: flex;
    width: 110px;
    height: 32px;
    margin-left: 10px;
    align-items: center;
    justify-content: center;
    //background-color: var(--charcoal);
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
    letter-spacing: 0.2px;
    margin-bottom: 4px;
    .btn-title {
      opacity: 0.6;
      letter-spacing: 0.6px;
    }
    img {
      margin-left: 6px;
    }

    &:hover {
      .btn-title {
        opacity: 1;
      }
    }
  }
}
.popover-custom {
  background: none;
  max-width: unset;
  border: none;

  ::v-deep {
    .arrow {
      display: none;
    }
  }

  .dropdown-viz-items-popover-container {
    width: 700px;
    height: 590px;

    border-radius: 4px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 4px 0 rgba(0, 0, 0, 0.16);
    background-color: var(--primary);
    padding: 4px;

    .dropdown-viz-items-scroll-container {
      justify-content: center;
      display: flex;
      flex-wrap: wrap;
      padding-bottom: 20px;
      height: auto;

      .dropdown-viz-item {
        ::v-deep {
          .visualization-item {
            @include item();
            width: 118px;
            height: 126px;
            margin: 10px;
            //padding: 24px 12px;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            img {
              //padding-top: 11px;
              width: 48px;
              height: 48px;
            }

            .title {
              @include regular-text();
              font-size: 12px;
              letter-spacing: 0.2px;
            }
          }
        }
      }
    }
  }
}
</style>
