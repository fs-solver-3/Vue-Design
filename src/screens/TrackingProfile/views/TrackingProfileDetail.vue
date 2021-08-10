<template>
  <div class="d-flex flex-column h-100 w-100">
    <template>
      <transition name="header-fade" mode="out-in">
        <HeaderBar :showLogout="true" />
      </transition>
    </template>
    <div class="user-profile-details-container">
      <div class="user-profile-details-header">
        <router-link to="/tracking-profile">
          <div class="regular-icon-16 btn-ghost">
            <img src="@/assets/icon/ic-16-arrow-left.svg" alt="Back to User Profile" />
          </div>
        </router-link>
        <span class="regular-text-24">{{ currentUserProfileDisplayName }}</span>
      </div>
      <div class="user-profile-details-body">
        <Contact />
        <Activity />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';
import { mapState } from 'vuex';
import NProgress from 'nprogress';
import { FadeTransition } from 'vue2-transitions';

import Contact from '@/screens/TrackingProfile/components/TrackingProfileDetail/Contact.vue';
import Activity from '@/screens/TrackingProfile/components/TrackingProfileDetail/Activity.vue';
import { Routers, Stores } from '@/shared';
import { ProfileActivityModule } from '@/screens/TrackingProfile/store/profile_activity.store';
import { Log } from '@core/utils';

NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

@Component({
  components: {
    FadeTransition,
    Contact,
    Activity
  },
  computed: {
    ...mapState(Stores.profileActivityStore, ['profileDetailsId'])
  }
})
export default class TrackingProfileDetail extends Vue {
  profileDetailsId!: string;

  constructor() {
    super();
  }

  beforeDestroy() {
    ProfileActivityModule.resetUserActivitiesStates();
  }

  async beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext<any>) {
    try {
      NProgress.start();
      const profileDetailsId: string = to.params.username;
      await ProfileActivityModule.getEvents(profileDetailsId);
      next();
    } catch (e) {
      Log.error(`BeforeRouteEnter getting an error: ${e?.message}`);
      next({ name: Routers.notFound });
    } finally {
      NProgress.done();
    }
  }

  @Watch('profileDetailsId', { immediate: true, deep: true })
  async profileDetailsIdChanged() {
    try {
      NProgress.start();
      const currentDate = new Date();
      const priorDate = new Date().setDate(currentDate.getDate() - 1);
      ProfileActivityModule.setFromTime({ fromTime: new Date(priorDate).getTime() });
      ProfileActivityModule.setToTime({ toTime: currentDate.getTime() });
      ProfileActivityModule.clearUserActivitiesByEventId();
      await ProfileActivityModule.getTrackingProfile();
      await ProfileActivityModule.getUserActivities();
    } catch (e) {
      Log.error(`Get tracking profile error: ${e?.message}`);
    } finally {
      NProgress.done();
    }
  }

  get currentUserProfileDisplayName(): string | undefined {
    const trackingProfile = ProfileActivityModule.trackingProfile;
    const name = trackingProfile?.profile?.fullName ?? trackingProfile?.profile?.userId;

    return name ? `${name}'s profile` : 'Profile Details';
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';
@import '~bootstrap/scss/bootstrap-grid';

.user-profile-details-container {
  height: 100%;
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.user-profile-details-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.user-profile-details-body {
  display: flex;
  flex-direction: row;
  align-content: flex-start;
  padding-top: 16px;
  height: calc(100vh - 132px);
  width: 100%;

  @media all and (max-width: 880px) {
    flex-wrap: wrap;
    height: 100%;
  }
}
</style>

<style>
body {
  height: 100vh;
}
</style>
