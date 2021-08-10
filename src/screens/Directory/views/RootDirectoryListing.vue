<template>
  <div>
    <BaseDirectoryListing :directoryId="directoryId" :isLoading="isLoading">
      <template #default>
        <DiDropdown
          :id="genDropdownId('main')"
          v-model="selectedCategory"
          :data="options"
          class="select-chat-list root-directory-container"
          valueProps="type"
        />
      </template>
    </BaseDirectoryListing>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import BaseDirectoryListing from '@/screens/Directory/views/BaseDirectoryListing.vue';
import DirectoryCategory from '@/screens/Directory/components/DirectoryCategory.vue';
import { DirectoryModule } from '@/screens/Directory/store/directory.store';
import { LabelNode, Routers } from '@/shared';
import { Route } from 'vue-router';
import { NavigationGuardNext } from 'vue-router/types/router';
import { RouteUtils } from '@/utils/routes.utils';
import { Log } from '@core/utils';

export enum SpecialDirectoryId {
  myData = -1,
  sharedWithMe = -2
}

export enum CategoryValue {
  myData = 'myData',
  sharedWithMe = 'sharedWithMe'
}

@Component({
  components: {
    BaseDirectoryListing,
    DirectoryCategory
  }
})
export default class RootDirectoryListing extends Vue {
  private options: LabelNode[];
  private selectedCategory: CategoryValue;
  private directoryId: SpecialDirectoryId = this.getDirectoryId; //number | null = null;
  private isLoading = false;

  constructor() {
    super();
    // TODO: change type for enable selection
    this.options = [
      { label: 'My data', type: CategoryValue.myData },
      { label: 'Shared with me', type: CategoryValue.sharedWithMe },
      { label: 'Recent', type: '' },
      { label: 'Starred', type: '' },
      { label: 'Trash', type: '' }
    ];
    this.selectedCategory = this.categoryValue;
  }

  get currentRouteName() {
    return this.$route.name;
  }

  private get categoryValue() {
    switch (this.currentRouteName) {
      case Routers.sharedWithMe:
        return CategoryValue.sharedWithMe;
      default:
        return CategoryValue.myData;
    }
  }

  private get getDirectoryId() {
    switch (this.currentRouteName) {
      case Routers.sharedWithMe:
        return SpecialDirectoryId.sharedWithMe;
      default:
        return SpecialDirectoryId.myData;
    }
  }

  beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext<any>) {
    if (RouteUtils.isLogin() || RouteUtils.getToken(to)) {
      next();
    } else {
      next({ name: Routers.login });
    }
  }

  @Watch('selectedCategory')
  handleChangeDirectoryId(newCategoryValue: CategoryValue) {
    Log.debug('handleChangeDirectoryId', newCategoryValue);
    if (newCategoryValue === CategoryValue.myData) {
      DirectoryModule.saveRouteName({ routeName: Routers.subDirectory });
      this.$router.replace({ name: Routers.mydata });
    } else {
      DirectoryModule.saveRouteName({ routeName: Routers.subShared });
      this.$router.replace({ name: Routers.sharedWithMe });
    }
  }

  @Watch('$route.path')
  handleChangeRoute() {
    this.directoryId = this.getDirectoryId;
  }
}
</script>

<style lang="scss" scoped>
::v-deep {
  .select-container {
    margin-top: 0 !important;
  }

  .select-container > .relative > span > button {
    height: 44px;
    letter-spacing: 0.2px;
  }
}
</style>
