<template>
  <div class="d-flex flex-column h-100 w-100">
    <template>
      <transition mode="out-in" name="header-fade">
        <HeaderBar :showLogout="true" />
      </transition>
    </template>
    <div class="user-profile-container">
      <UserProfileHeader :isHaveFilter="isHaveFilter" class="user-profile-header" @clearFilters="clearFilters" @configColumnsChanged="configColumnsChanged" />
      <FilterBar
        ref="filterBar"
        :filters="filters"
        class="user-profile-filter"
        @onApplyFilter="handleApplyFilter"
        @onRemoveAt="handleRemoveFilterAt"
        @onStatusChange="handleFilterStatusChange"
        @onValuesChange="handleValuesFilterChange"
      />
      <fade-transition>
        <UserListingBody
          ref="divContainsTable"
          :fields="headers"
          :from="from"
          :isHaveResponse="!!userProfileData"
          :maxTableHeight="maxTableHeight"
          :records="records"
          class="user-profile-body"
          @onClickRow="handleClickRow"
        />
      </fade-transition>
      <UserListingFooter :totalRows="totalRows" class="user-profile-footer" @onPageChange="handleLoadPage" ref="userListingFooter" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Provide, Ref, Vue } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';
import { mapState } from 'vuex';
import NProgress from 'nprogress';
import { FadeTransition } from 'vue2-transitions';
import UserProfileHeader from '@/shared/components/user-listing/UserProfileHeader.vue';
import UserListingBody from '@/screens/TrackingProfile/components/TrackingProfile/UserListingBody.vue';
import ListingFooter from '@/shared/components/user-listing/ListingFooter.vue';
import { ProfileModule } from '@/screens/TrackingProfile/store/profile.store';
import { DataManager } from '@core/services';
import { Routers, Stores, TableSettingClass } from '@/shared';
import { DI } from '@core/modules';
import FilterBar from '@/shared/components/FilterBar.vue';
import { DynamicFilter, FilterWidget, TableSchema } from '@core/domain/Model';
import { SchemaUtils } from '@/utils/schema.utils';
import { DiTableHeader, Pagination } from '@/shared/models';
import { ListUtils } from '@/utils';
import { AbstractTableResponse } from '@core/domain/Response/Query/AbstractTableResponse';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';
import { Log } from '@core/utils';

NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

@Component({
  components: {
    FadeTransition,
    UserProfileHeader,
    FilterBar,
    UserListingBody,
    UserListingFooter: ListingFooter
  },
  computed: {
    ...mapState(Stores.profileStore, ['profileSettingInfo', 'userProfileData'])
  }
})
export default class TrackingProfile extends Vue {
  static readonly FILTER_KEY = 'profile';
  profileSettingInfo!: TableSchema;
  userProfileData!: AbstractTableResponse;

  @Ref()
  private readonly divContainsTable!: UserListingBody;

  @Ref()
  private readonly filterBar!: FilterBar;

  @Ref()
  userListingFooter!: ListingFooter;

  filters: DynamicFilter[] = [];
  initTableHeight: number;
  adjustmentTableHeight: number;

  constructor() {
    super();
    this.initTableHeight = 0;
    this.adjustmentTableHeight = 0;
  }

  get headers() {
    if (this.userProfileData) {
      return this.userProfileData.headers.map(header => {
        const result = new DiTableHeader({
          key: header.key?.toString(),
          label: header.label,
          tdClass: header.isTextLeft ? TableSettingClass.tdProfileTextLeftClass : TableSettingClass.tdProfileTextRightClass,
          isTextLeft: header.isTextLeft
        });
        Log.debug('headers::', result);
        return result;
      });
    }
    return [];
  }

  get records() {
    if (this.userProfileData) {
      return this.userProfileData.records;
    }
    return [];
  }

  get totalRows() {
    if (this.userProfileData) {
      return this.userProfileData.total;
    }
    return 0;
  }

  get isHaveFilter(): boolean {
    return ListUtils.isNotEmpty(this.filters);
  }

  get maxTableHeight(): number {
    return this.initTableHeight - this.adjustmentTableHeight;
  }

  private get dataManager(): DataManager {
    return DI.get(DataManager);
  }

  private get from(): number {
    return ProfileModule.currentFrom;
  }

  async beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext<any>) {
    try {
      NProgress.start();
      await ProfileModule.listProperties();
      next();
    } catch (e) {
      Log.error(`BeforeRouteEnter getting an error: ${e?.message}`);
      next({ name: Routers.notFound });
    } finally {
      NProgress.done();
    }
  }

  created() {
    const profileFields = this.getProfileFields();
    this.filters = this.getFilters();
    this.getUserProfileData(profileFields, this.filters);
  }

  mounted() {
    const currentHeight = this.dataManager.getHeightOfProfileTable();
    if (currentHeight > 0 && this.isSameViewPort()) {
      this.initTableHeight = currentHeight;
    } else {
      this.$nextTick(() => {
        this.initTableHeight = this.divContainsTable.$el.clientHeight - 32;
        this.dataManager.saveHeightOfClientViewport(window.innerHeight);
        this.dataManager.saveHeightOfProfileTable(this.initTableHeight);
      });
    }
  }

  configColumnsChanged(value: FieldDetailInfo[]) {
    this.dataManager.saveUserProfileConfigColumns(value);
    this.getUserProfileData(value);
  }

  configFilterChanged(filters: DynamicFilter[]) {
    this.handleFiltersChanged(filters);
  }

  clearFilters(value: DynamicFilter[]) {
    this.filters = value;
    this.handleFiltersChanged(value);
    this.adjustmentTableHeight = 0;
  }

  @Provide()
  handleResetFilter() {
    this.clearFilters([]);
  }

  private async getUserProfileData(fields?: FieldDetailInfo[], filters?: FilterWidget[]) {
    try {
      NProgress.start();
      if (fields) {
        await ProfileModule.editConfigColumns({ fields: fields });
      }
      if (filters) {
        ProfileModule.configFilterRequests(filters);
      }
      await ProfileModule.queryUserProfileData();
    } catch (e) {
      Log.error(`Created UserProfile getting an error: ${e?.message}`);
    } finally {
      NProgress.done();
    }
  }

  private handleFiltersChanged(filters: DynamicFilter[]) {
    this.dataManager.saveMainFilters(TrackingProfile.FILTER_KEY, filters);
    this.getUserProfileData(void 0, filters);
  }

  private handleRemoveFilterAt(index: number) {
    Log.debug('handleRemoveFilterAt::');
    this.filters = ListUtils.removeAt(this.filters, index);
    this.configFilterChanged(this.filters);
  }

  private handleApplyFilter(filterApplied: DynamicFilter) {
    Log.debug('handleApplyFilter::');
    this.configFilterChanged(this.filters);
  }

  private handleFilterStatusChange(filterStatusChange: DynamicFilter) {
    Log.debug('handleFilterStatusChange::');
    this.configFilterChanged(this.filters);
  }

  private handleValuesFilterChange(filter: DynamicFilter) {
    Log.debug('handleValuesFilterChange::', filter);
    this.configFilterChanged(this.filters);
  }

  @Provide()
  private handleAddNewFilter(profileField: FieldDetailInfo) {
    const filter: DynamicFilter = DynamicFilter.from(profileField.field, profileField.displayName, profileField.isNested);
    this.filters.push(filter);
    this.dataManager.saveMainFilters(TrackingProfile.FILTER_KEY, this.filters);
    // showFilter
    const filterIndex: number = this.filters.indexOf(filter);
    this.filterBar.showFilter(filterIndex);

    this.$nextTick(() => {
      this.adjustmentTableHeight = this.filterBar.height;
    });
  }

  private getProfileFields(): FieldDetailInfo[] {
    const fields = this.dataManager.getUserProfileConfigColumns();
    if (fields && fields.length === 0) {
      return SchemaUtils.buildFieldsFromTableSchema(this.profileSettingInfo);
    } else {
      return fields;
    }
  }

  private getFilters(): DynamicFilter[] {
    return this.dataManager.getMainFilters(TrackingProfile.FILTER_KEY);
  }

  private isSameViewPort() {
    const previousHeightOfViewport = this.dataManager.getHeightOfClientViewport();
    if (previousHeightOfViewport === window.innerHeight) {
      return true;
    }
    return false;
  }

  private handleClickRow(record: any) {
    const indexOfUserId = this.headers.find(x => x.label === 'User Id')?.key;
    let userId = '';
    if (indexOfUserId) {
      userId = record[+indexOfUserId];
    }
    this.$router
      .push({
        name: Routers.trackingProfileDetail,
        params: {
          username: userId
        }
      })
      .catch(err => {
        if (err.name !== 'NavigationDuplicated' && !err.message.includes('Avoided redundant navigation to current location')) {
          throw err;
        }
      });
  }

  private async handleLoadPage(pagination: Pagination) {
    try {
      NProgress.start();
      const currentFrom = (pagination.page - 1) * pagination.rowsPerPage;
      const currentSize = pagination.rowsPerPage;
      await ProfileModule.setCurrentFrom({ currentFrom: currentFrom });
      await ProfileModule.setCurrentSize({ currentSize: currentSize });
      await ProfileModule.queryUserProfileData();
    } catch (e) {
      Log.error(`UserProfile paging getting an error: ${e?.message}`);
    } finally {
      NProgress.done();
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

.user-profile-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px) !important;
  padding: 32px;
}

.user-profile-header {
  max-height: 40px;
  min-height: 40px;
  order: 0;
}

.user-profile-filter {
  order: 1;
}

.user-profile-body {
  border-radius: 4px;
  flex-grow: 2;
  margin-bottom: 16px;
  margin-top: 8px;
  order: 2;
}

.user-profile-footer {
  max-height: 40px;
  min-height: 40px;
  order: 3;
}
</style>

<style>
body {
  height: 100vh;
}
</style>
