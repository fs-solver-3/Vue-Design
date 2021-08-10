<template>
  <div class="user-profile-footer-container">
    <div class="user-profile-footer-total">
      <span>Total {{ totalRowTitle }}(s): {{ totalRows }}</span>
    </div>
    <div class="user-profile-footer-pagination">
      <div class="per-page-content">
        Shows
        <EditableSelect
          class="select-per-page-list"
          :defaultValue="pagination.rowsPerPage"
          :items="perPageListItems"
          @selectedValue="perPageChanged"
          backgroundColor="#272a36"
        />
        entries
      </div>
      <b-pagination
        v-model="pagination.page"
        :total-rows="totalRows"
        :per-page="pagination.rowsPerPage"
        pills
        hide-ellipsis
        :limit="3"
        size="sm"
        class="table-pagination"
        @change="onPageChanged"
        ref="refPagination"
      >
        <template v-slot:first-text>
          <b-icon-chevron-double-left />
        </template>
        <template v-slot:prev-text>
          <b-icon-chevron-left />
        </template>
        <template v-slot:next-text>
          <b-icon-chevron-right />
        </template>
        <template v-slot:last-text>
          <b-icon-chevron-double-right />
        </template>
      </b-pagination>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { DefaultPaging } from '@/shared';
import { Pagination } from '@/shared/models';

@Component
export default class ListingFooter extends Vue {
  @Prop({ type: Number, required: true })
  private totalRows!: number;

  @Prop({ default: 'profile', type: String })
  totalRowTitle!: string;

  protected pagination: Pagination;

  private perPageListItems = [
    // { display: '5', value: 5 },
    { display: '10', value: 10 },
    { display: '15', value: 15 },
    { display: '20', value: 20 },
    { display: '30', value: 30 },
    { display: '50', value: 50 },
    { display: '100', value: 100 },
    { display: '200', value: 200 }
  ];

  constructor() {
    super();
    this.pagination = new Pagination({ page: 1, rowsPerPage: DefaultPaging.defaultForDashboardDetail });
  }

  onPageChanged(page: number) {
    this.pagination.page = page;
    this.handleLoadPage(this.pagination);
  }

  perPageChanged(value: number) {
    this.pagination.rowsPerPage = value;
    this.pagination.page = 1;
    this.handleLoadPage(this.pagination);
  }

  @Emit('onPageChange')
  private handleLoadPage(pagination: Pagination) {
    return pagination;
  }
}
</script>
<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

.user-profile-footer-container {
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
}

.user-profile-footer-total {
  order: 0;
  flex-grow: 2;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  @media (max-width: 370px) {
    display: none;
  }
}

.user-profile-footer-pagination {
  order: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  @media (max-width: 390px) {
    margin-left: auto !important;
  }
}

.table-pagination {
  align-items: center;
}

ul {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.per-page-content {
  display: flex;
  flex-direction: row;
  @include regular-text;
  font-size: 12px;
  letter-spacing: 0.2px;
  align-items: center;
  text-align: center;
  margin-right: 15px;

  @media (max-width: 390px) {
    display: none;
  }
}

::v-deep {
  .autocomplete input {
    margin: 0px 5px;
    width: 30px;
  }

  .page-link {
    color: var(--white) !important;
    background-color: rgba(#d8d8d8, 0.1) !important;
    border: none !important;
    border-radius: 7px;
  }

  .page-item.active .page-link {
    background-color: var(--accent) !important;
  }

  .page-item.disabled .page-link {
    color: var(--neutral) !important;
    pointer-events: none !important;
    cursor: not-allowed !important;
  }
}
</style>
