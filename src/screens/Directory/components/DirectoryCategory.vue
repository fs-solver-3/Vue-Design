<template>
  <div class="row no-gutters category-background">
    <div class="col-10">
      <b-form-select v-model="selectedCategory" :options="options" class="h-44px"></b-form-select>
    </div>
    <div class="col-2">
      <b-icon-chevron-down class="mar-t-15" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { DirectoryCategoryItem } from '@/shared/constants';
import { DirectoryPagingRequest, SortDirection, Sort } from '@core/domain/Request';
import { DirectoryModule } from '@/screens/Directory/store/directory.store';

@Component
export default class DirectoryCategory extends Vue {
  selectedCategory?: string;
  options: any[];

  constructor() {
    super();
    this.options = [
      { value: DirectoryCategoryItem.MyData, text: 'My data' },
      { value: DirectoryCategoryItem.SharedWithMe, text: 'Shared with me' },
      { value: DirectoryCategoryItem.Recent, text: 'Recent' },
      { value: DirectoryCategoryItem.Starred, text: 'Starred' },
      { value: DirectoryCategoryItem.Trash, text: 'Trash' }
    ];
    this.selectedCategory = DirectoryCategoryItem.MyData;
  }

  @Watch('selectedCategory')
  formSelectChanged(value: string) {
    // TODO: should search with selected category
    DirectoryModule.list({
      directoryId: 10,
      sort: new DirectoryPagingRequest({
        sorts: [
          new Sort({
            field: 'name',
            order: SortDirection.Asc
          })
        ],
        from: 0,
        size: 0
      })
    });
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/di-variables';
@import '~@/themes/scss/mixin';

select {
  background-color: $headerColor !important;
  font-size: 14px !important;
  @include regular-text;
  padding-left: 0.75rem !important;
}

.category-background {
  border-radius: 4px 4px 0px 0px !important;
  background-color: $headerColor !important;
}
</style>
