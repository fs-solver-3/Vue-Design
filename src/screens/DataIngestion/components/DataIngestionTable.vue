<template>
  <div class="table-container position-relative d-flex flex-column justify-content-between">
    <StatusWidget class="table-status-widget" :error="errorMessage" :status="status" @retry="emitRetry">
      <CustomTable
        id="table"
        class="table-right-border table"
        :headers="headers"
        :rows="records"
        :is-show-footer="false"
        :cell-width="cellWidth"
        :row-height="67"
      ></CustomTable>
    </StatusWidget>
    <ListingFooter v-if="enablePagination" class="footer-table" :total-rows="total" total-row-title="row" @onPageChange="emitPageChange"></ListingFooter>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { HeaderData, Pagination, RowData } from '@/shared/models';
import CustomTable from '@chart/CustomTable/CustomTable.vue';
import { Status } from '@/shared';
import ListingFooter from '@/shared/components/user-listing/ListingFooter.vue';
import { Log } from '@core/utils';

@Component({
  components: { ListingFooter, CustomTable }
})
export default class DataIngestionTable extends Vue {
  @Prop({ required: true })
  status!: Status;

  @Prop({ required: true })
  errorMessage!: string;

  @Prop({ required: true })
  headers!: HeaderData[];

  @Prop({ required: true })
  records!: RowData[];

  @Prop({ required: true })
  total!: number;

  @Prop({ required: false, type: Number })
  private readonly cellWidth?: number;

  private get enablePagination() {
    Log.debug('total::', this.total, this.records.length);
    if (this.total > 20) {
      return true;
    } else {
      return false;
    }
  }
  @Emit('onRetry')
  private emitRetry(event: Event): Event {
    return event;
  }

  @Emit('onPageChange')
  private emitPageChange(pagination: Pagination): Pagination {
    return pagination;
  }

  @Emit('onPerPageChange')
  private emitDisplayNumRowChange(rowPerPage: number): number {
    return rowPerPage;
  }
}
</script>

<style lang="scss">
@import '~@/themes/scss/mixin';
@import '~@/themes/scss/di-variables';

.table-container {
  .table-status-widget {
    height: calc(100% - 35px) !important;
    .table {
      height: 100%;

      .infinite-table {
        height: 100% !important;

        tr {
          td,
          th {
            font-size: 16px !important;
          }
          td {
            opacity: 0.8 !important;
          }
        }
      }
    }
  }
  .footer-table {
    font-size: 16px !important;

    .user-profile-footer-total {
      @include media-breakpoint-down(sm) {
        display: none;
      }
    }

    .per-page-content {
      font-size: 14px !important;
    }

    input {
      border: none;
      background: var(--charcoal-2);
      text-decoration: underline;
    }
  }
}
</style>
