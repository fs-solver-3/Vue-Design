<template>
  <VueBlocListener :bloc="listingBloc" @onStateChange="handleStateChanged">
    <StatusWidget class="lazy-listing" :class="statusClass" :error="errorMsg" :status="status" @retry="handleRetry">
      <template #default>
        <vuescroll @handle-scroll="handleScroll" style="overflow: scroll">
          <DataListing :keyForDisplay="labelProp" :keyForValue="valueProp" :records="data" @onClick="emitClickItem" />
        </vuescroll>
      </template>
    </StatusWidget>
  </VueBlocListener>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { ListingBloc } from '@/screens/DashboardDetail/components/DrillThrough/ListingBloc/ListingBloc';
import { ListingError, ListingLoaded, ListingLoading, ListingState } from '@/screens/DashboardDetail/components/DrillThrough/ListingBloc/ListingState';
import StatusWidget from '@/shared/components/StatusWidget.vue';
import { Status } from '@/shared';
import DataListing from '@/screens/DashboardDetail/components/WidgetContainer/charts/ActionWidget/DataListing.vue';

@Component({
  components: { DataListing, StatusWidget }
})
export default class LazyListing extends Vue {
  private status = Status.Loading;
  private errorMsg = '';
  private data: any[] = [];
  @Prop({ required: true })
  private readonly listingBloc!: ListingBloc;
  @Prop({ required: false, type: String, default: 'label' })
  private readonly labelProp!: string;
  @Prop({ required: false, type: String, default: 'id' })
  private readonly valueProp!: string;

  @Prop({ default: 0.8, type: Number })
  private positionLoadMore!: number;

  private get statusClass(): any {
    return {
      'lazy-loaded': this.status === Status.Loaded
    };
  }

  mounted() {
    this.data = this.listingBloc.data;
  }

  private handleRetry(): void {
    this.listingBloc.reload();
  }

  private handleStateChanged(state: ListingState): void {
    switch (state.constructor) {
      case ListingLoading:
        this.handleStateLoading(state as ListingLoading);
        break;
      case ListingLoaded:
        this.handleStateLoaded(state as ListingLoaded);
        break;
      case ListingError:
        this.handleStateError(state as ListingError);
        break;
    }
  }

  private handleStateLoading(state: ListingLoading) {
    this.status = Status.Loading;
    this.errorMsg = '';
  }

  private handleStateLoaded(state: ListingLoaded) {
    this.status = Status.Loaded;
    this.data = state.data;
    this.errorMsg = '';
  }

  private handleStateError(state: ListingError) {
    this.status = Status.Error;
    this.errorMsg = state.errorMsg;
  }

  @Emit('onClick')
  private emitClickItem(item: any): void {
    return item;
  }

  handleScroll(vertical: { process: number }) {
    const { process } = vertical;
    if (process > this.positionLoadMore) {
      this.listingBloc.loadMore();
    }
  }
}
</script>

<style lang="scss">
.lazy-listing {
  h4 {
    font-size: 14px;
    font-stretch: normal;
    font-style: normal;
    font-weight: normal;
    line-height: normal;
    opacity: 0.8;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: left;
  }
}

.lazy-loaded {
  overflow: hidden;
  position: relative;
}
</style>
