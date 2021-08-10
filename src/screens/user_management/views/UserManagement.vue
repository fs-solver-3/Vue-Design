<template>
  <div class="d-flex flex-column h-100 w-100">
    <template>
      <transition mode="out-in" name="header-fade">
        <HeaderBar :showLogout="true" />
      </transition>
    </template>
    <div class="user-profile-container">
      <UserManagementHeader class="user-management-header"></UserManagementHeader>
      <MessageContainer v-if="message" :message-type="messageType" :message="message"></MessageContainer>
      <fade-transition>
        <UserListingBody
          ref="divContainsTable"
          :fields="header"
          :from="from"
          :maxTableHeight="maxTableHeight"
          :records="userProfileTableRows"
          :isHaveResponse="userProfileTableRows.length > 0"
          class="user-profile-body"
          @onClickRow="handleClickRow"
        />
      </fade-transition>
      <UserListingFooter :totalRows="totalProfile" class="user-profile-footer" @onPageChange="handleOnPageChange" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Provide, Ref, Vue } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';
import { mapState } from 'vuex';
import NProgress from 'nprogress';
import { FadeTransition } from 'vue2-transitions';
import UserManagementHeader from '@/screens/user_management/components/user_profile_listing/UserManagementHeader.vue';
import UserListingBody from '@/screens/TrackingProfile/components/TrackingProfile/UserListingBody.vue';
import ListingFooter from '@/shared/components/user-listing/ListingFooter.vue';
import { DataManager } from '@core/services';
import { DefaultPaging, Routers, Stores } from '@/shared';
import { DI } from '@core/modules';
import { DynamicFilter } from '@core/domain/Model';
import { Pagination } from '@/shared/models';
import { UserProfileListingModule } from '@/screens/user_management/store/user_profile_listing.store';
import { UserProfileTableRow } from '@/shared/interfaces/user_profile_table.interface';
import { FieldDetailInfo } from '@core/domain/Model/Function/FieldDetailInfo';
import MessageContainer, { MessageType } from '@/shared/components/MessageContainer.vue';
import { ProfileModule } from '@/screens/TrackingProfile/store/profile.store';
import { Log } from '@core/utils';

NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

@Component({
  components: {
    MessageContainer,
    FadeTransition,
    UserManagementHeader,
    UserListingBody,
    UserListingFooter: ListingFooter
  },
  computed: {
    ...mapState(Stores.userProfileListingStore, ['userProfileTableRows', 'totalProfile'])
  }
})
export default class UserManagement extends Vue {
  static readonly FILTER_KEY = 'profile';
  private userProfileTableRows!: UserProfileTableRow[];
  private totalProfile!: number;
  private header!: any[];

  messageType!: MessageType;
  message = '';

  @Ref()
  divContainsTable!: any;

  @Ref()
  divContainsFilter!: any;

  filters: DynamicFilter[] = [];
  initTableHeight: number;
  adjustmentTableHeight: number;

  constructor() {
    super();
    this.initTableHeight = 0;
    this.adjustmentTableHeight = 0;
    this.header = UserProfileListingModule.headerInfos;
  }

  get maxTableHeight(): number {
    return this.initTableHeight - this.adjustmentTableHeight;
  }

  private get dataManager(): DataManager {
    return DI.get(DataManager);
  }

  private get from(): number {
    return UserProfileListingModule.from;
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
    UserProfileListingModule.setFromAndSize({ from: 0, size: DefaultPaging.defaultForDashboardDetail });
    UserProfileListingModule.loadUserProfileListing().catch(e => {
      this.message = e.message;
      this.messageType = MessageType.ERROR;
    });
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

  destroyed() {
    UserProfileListingModule.reset();
  }

  @Provide()
  private handleAddNewFilter(profileField: FieldDetailInfo) {
    const filter = DynamicFilter.from(profileField.field, profileField.displayName, profileField.isNested);
    this.filters.push(filter);
    this.dataManager.saveMainFilters(UserManagement.FILTER_KEY, this.filters);
    this.$nextTick(() => {
      this.adjustmentTableHeight = this.divContainsFilter.$refs?.divFilters.clientHeight;
    });
  }

  private isSameViewPort() {
    const previousHeightOfViewport = this.dataManager.getHeightOfClientViewport();
    if (previousHeightOfViewport === window.innerHeight) {
      return true;
    }
    return false;
  }

  private handleClickRow(record: any) {
    this.$router
      .push({
        name: Routers.userManagementDetails,
        params: {
          username: record.username
        }
      })
      .catch(err => {
        if (err.name !== 'NavigationDuplicated' && !err.message.includes('Avoided redundant navigation to current location')) {
          throw err;
        }
      });
  }

  private handleOnPageChange(paging: Pagination) {
    // TODO: load page
    UserProfileListingModule.setFromAndSize({ from: paging.from, size: paging.size });
    UserProfileListingModule.loadUserProfileListing();
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

.user-management-header {
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
