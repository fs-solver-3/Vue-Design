<template>
  <BaseDirectoryListing :directoryId="directoryIdValue">
    <router-link class="w-100 d-flex justify-content-between flex-nowrap row no-gutters root-directory-background h-44px" :to="to">
      <div class="text-left w-75">
        <label class="mr-auto">{{ category }}</label>
      </div>
      <div>
        <b-icon-chevron-right class="ic-16 icon-position justify-content-end" />
      </div>
    </router-link>
  </BaseDirectoryListing>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseDirectoryListing from '@/screens/Directory/views/BaseDirectoryListing.vue';
import { Routers } from '@/shared';
import { CategoryValue } from '@/screens/Directory/views/RootDirectoryListing.vue';
import { RouteUtils } from '@/utils/routes.utils';
import { Location } from 'vue-router';
import { Log } from '@core/utils';

@Component({
  components: {
    BaseDirectoryListing
  }
})
export default class SubDirectoryListing extends Vue {
  @Prop({ required: true, type: [String, Number] })
  private readonly directoryId: string | undefined;

  get directoryIdValue() {
    return parseInt(this.directoryId ?? '0');
  }

  options = [
    { label: 'My data', type: CategoryValue.myData },
    { label: 'Shared with me', type: CategoryValue.sharedWithMe },
    { label: 'Recent', type: '' },
    { label: 'Starred', type: '' },
    { label: 'Trash', type: '' }
  ];
  selectedCategory = this.selectedCategoryValue;

  get to(): string | Location {
    return { path: this.routerPath, query: { token: this.token } };
  }

  get selectedCategoryValue() {
    switch (this.currentRoute.name) {
      case Routers.subShared:
        return CategoryValue.sharedWithMe;
      default:
        return CategoryValue.myData;
    }
  }

  private get currentRoute() {
    return this.$router.currentRoute;
  }

  private get category() {
    Log.debug('category::', this.currentRoute.name);
    switch (this.currentRoute.name) {
      case Routers.subShared:
        return 'Shared with me';
      default:
        return 'My data';
    }
  }

  private get routerPath() {
    Log.debug('path::', this.currentRoute.name);

    switch (this.currentRoute.name) {
      case Routers.subShared:
        return '/shared';
      default:
        return '/mydata';
    }
  }

  private get token(): string {
    return RouteUtils.getToken(this.currentRoute);
  }
  //
  // created() {
  //   this.directoryId = +this.$route.params.directoryId;
  // }
}
</script>

<style lang="scss" scoped>
label {
  padding-top: 14px !important;
  padding-left: 12px !important;
  cursor: pointer !important;
  color: var(--text-color) !important;
  opacity: 1 !important;
  font-size: 14px !important;
  text-transform: none !important;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
}

.icon-position {
  margin-top: 15px;
  margin-right: 8px;
  opacity: 0.5;
}
</style>
