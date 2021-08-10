<template>
  <VueContext ref="menu" :close-on-click="false" :close-on-scroll="false" class="dashboard-context-menu" tag="div" @close="removeListenScroll">
    <div class="dashboard-listing">
      <!--      <div class="custom-search-input">-->
      <!--        <SearchInput :timeBound="200" hintText="Search directory" @onTextChanged="handleKeywordChanged" />-->
      <!--      </div>-->
      <LazyListing :listingBloc="listingBloc" label-prop="name" value-prop="dashboardId" @onClick="handleClickItem"></LazyListing>
    </div>
  </VueContext>
</template>

<script lang="ts">
import { Component, Ref } from 'vue-property-decorator';
import VueContext from 'vue-context';
import LazyListing from '@/screens/DashboardDetail/components/DrillThrough/LazyListing.vue';
import { ListingBloc } from '@/screens/DashboardDetail/components/DrillThrough/ListingBloc/ListingBloc';
import { DashboardId } from '@core/domain';
import { isFunction } from 'lodash';
import SearchInput from '@/shared/components/SearchInput.vue';
import { AutoHideContextMenu } from '@/screens/DashboardDetail/components/AutoHideContextMenu';

@Component({
  components: {
    SearchInput,
    LazyListing,
    VueContext
  }
})
export default class DashboardListingContextMenu extends AutoHideContextMenu {
  @Ref()
  private readonly menu?: VueContext;

  private readonly listingBloc = new ListingBloc();
  private onSelectDashboard: ((id: DashboardId) => void) | null = null;

  show(event: MouseEvent, onSelectDashboard: (id: DashboardId) => void) {
    this.onSelectDashboard = onSelectDashboard;
    this.menu?.open(event, {});
    this.listingBloc.search('');
    this.listenScroll();
  }

  hide() {
    this.menu?.close();
  }

  beforeDestroy() {
    this.removeListenScroll();
  }

  private handleClickItem(dashboardId: DashboardId): void {
    this.hide();
    if (isFunction(this.onSelectDashboard)) {
      this.onSelectDashboard(dashboardId);
    }
  }

  private handleKeywordChanged(keyword: string): void {
    this.listingBloc.search(keyword);
  }
}
</script>

<style lang="scss">
div.v-context.dashboard-context-menu {
  background: var(--primary);

  border: none;
  box-shadow: none;
  max-height: 360px;
  min-height: 160px;

  padding: 8px 0;
  //max-width: 220px;
  width: 220px;
  //overflow: hidden;
  //padding: 0;

  .dashboard-listing {
    display: flex;
    flex-direction: column;
    margin: 0 8px;
    max-height: 320px;
    position: relative;

    .lazy-loaded .__vuescroll {
      height: 280px !important;
      max-height: 280px;

      .__view {
        width: unset !important;
      }
    }

    //.custom-search-input {
    //  background-color: var(--secondary);
    //
    //  padding-left: 4px;
    //  padding-right: 4px;
    //
    //  .input-search-input,
    //  input {
    //    background: none;
    //  }
    //}

    .lazy-listing {
      //margin-top: 8px;
      min-height: 160px;
      position: relative;

      > .status-loading {
        position: absolute;
      }
    }
  }
}
</style>
