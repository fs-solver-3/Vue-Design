import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { AuthenticationModule } from '@/store/modules/authentication.store';
import { Routers } from '@/shared/enums/routers.enum';
import { RouteUtils } from '@/utils/routes.utils';
import DiAnalytics from '@datainsider/di-web-analytics';
import SharedDirectory from '@/screens/Directory/views/SharedDirectory.vue';
import { Log } from '@core/utils';

Vue.use(VueRouter);

// TODO: Please! don't delete comment in import
const RootDirectoryListing = () => import(/* webpackChunkName: "directory" */ '@/screens/Directory/views/RootDirectoryListing.vue');
const SubDirectoryListing = () => import(/* webpackChunkName: "directory" */ '@/screens/Directory/views/SubDirectoryListing.vue');

const DashboardDetail = () => import(/* webpackChunkName: "dashboard" */ '@/screens/DashboardDetail/views/DashboardDetail.vue');
const ChartBuilder = () => import(/* webpackChunkName: "dashboard" */ '@/screens/ChartBuilder/views/DataBuilder.vue');

const TrackingProfile = () => import(/* webpackChunkName: "tracking-profile" */ '@/screens/TrackingProfile/views/TrackingProfile.vue');
const TrackingProfileDetail = () => import(/* webpackChunkName: "tracking-profile" */ '@/screens/TrackingProfile/views/TrackingProfileDetail.vue');

const UserManagement = () => import(/* webpackChunkName: "user-profile" */ '@/screens/user_management/views/UserManagement.vue');
const UserManagementDetails = () => import(/* webpackChunkName: "user-profile" */ '@/screens/user_management/views/UserManagementDetails.vue');

const DataManagement = () => import(/* webpackChunkName: "data-management" */ '@/screens/DataManagement/views/DataManagement.vue');
const DataSchema = () => import(/* webpackChunkName: "data-schema" */ '@/screens/DataManagement/views/DataSchema/DataSchema.vue');
const QueryEditor = () => import(/* webpackChunkName: "query-editor" */ '@/screens/DataManagement/views/QueryEditor/QueryEditor.vue');
const DataRelationship = () => import(/* webpackChunkName: "data-relationship" */ '@/screens/DataManagement/views/DataRelationship/DataRelationship.vue');

const DataIngestion = () => import(/* webpackChunkName: "data-ingestion" */ '@/screens/DataIngestion/views/DataIngestion.vue');
const DataSource = () => import(/* webpackChunkName: "datasource" */ '@/screens/DataIngestion/components/DataSourceScreen.vue');
const Job = () => import(/* webpackChunkName: "job" */ '@/screens/DataIngestion/components/JobScreen.vue');
const JobHistory = () => import(/* webpackChunkName: "job-history" */ '@/screens/DataIngestion/components/JobHistoryScreen.vue');

const Login = () => import(/* webpackChunkName: "welcome" */ '@/screens/BasicLogin/Login.vue');
const SignIn = () => import(/* webpackChunkName: "welcome" */ '@/screens/BasicLogin/components/SignIn/SignIn.vue');

const NotFound = () => import(/* webpackChunkName: "not-found" */ '@/screens/NotFound.vue');

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: { name: Routers.login }
  },
  {
    path: '/mydata',
    component: RootDirectoryListing,
    name: Routers.mydata
  },
  {
    path: '/mydata/:directoryId',
    name: Routers.subDirectory,
    component: SubDirectoryListing,
    props: true
  },
  {
    path: '/shared',
    component: RootDirectoryListing,
    name: Routers.sharedWithMe
  },
  {
    path: '/shared/:directoryId',
    name: Routers.subShared,
    component: SubDirectoryListing,
    props: true
  },
  {
    path: '/shared/:directoryId?token=:token',
    name: Routers.subShared,
    component: SubDirectoryListing,
    props: true
  },

  {
    path: '/',
    name: 'WelcomePage',
    component: Login,
    children: [{ path: 'login', component: SignIn, name: Routers.login }]
  },
  {
    path: '/dashboard/:dashboardId',
    name: Routers.dashboardDetail,
    component: DashboardDetail,
    props: true
  },
  // {
  //   path: '/dashboard/:dashboardId?token=:token',
  //   name: Routers.dashboardDetail,
  //   component: DashboardDetail,
  //   props: true
  // },

  {
    path: '/chart-builder',
    name: Routers.chartBuilder,
    component: ChartBuilder,
    props: true
  },
  {
    path: '/tracking-profile',
    name: Routers.trackingProfile,
    component: TrackingProfile,
    props: true
  },
  {
    path: '/tracking-profile/:username',
    name: Routers.trackingProfileDetail,
    component: TrackingProfileDetail,
    props: true
  },
  {
    path: '/user-management',
    name: Routers.userManagement,
    component: UserManagement,
    props: true
  },
  {
    path: '/user-management/:username',
    name: Routers.userManagementDetails,
    component: UserManagementDetails,
    props: true
  },
  {
    path: '/data-management',
    name: Routers.dataManagement,
    component: DataManagement,
    redirect: '/data-management/schema',
    props: true,
    children: [
      {
        path: '/data-management/schema',
        name: Routers.dataSchema,
        component: DataSchema,
        props: true
      },
      {
        path: '/data-management/query-editor',
        name: Routers.queryEditor,
        component: QueryEditor,
        props: true
      },
      {
        path: '/data-management/relationship',
        name: Routers.dataRelationship,
        component: DataRelationship,
        props: true
      }
    ]
  },
  {
    path: '/data-ingestion',
    name: Routers.dataIngestion,
    component: DataIngestion,
    props: true,
    children: [
      {
        path: '/data-ingestion',
        name: Routers.dataSource,
        component: DataSource,
        props: true
      },
      {
        path: '/data-ingestion/job',
        name: Routers.job,
        component: Job,
        props: true
      },
      {
        path: '/data-ingestion/job-history',
        name: Routers.jobHistory,
        component: JobHistory,
        props: true
      }
    ]
  },
  {
    path: '/notfound',
    name: Routers.notFound,
    component: NotFound,
    props: true
  },
  {
    path: '*',
    redirect: { name: Routers.notFound, params: { resource: 'page' } }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  // reset page when navigate to other page
  scrollBehavior: (to, from, savedPosition) => {
    return { x: 0, y: 0 };
  }
});

router.beforeEach(async (to, from, next) => {
  Log.debug('From::', from.path, 'to::', to.path);
  next();
  Log.debug(`Router::beforeEach:: open ${to.name} from ${from.name}  at ${Date.now()}`);

  await DiAnalytics.enterScreenStart(to.name || '');

  if (RouteUtils.isRoot(to.name) || RouteUtils.isNotNeedSession(to.name!)) {
    // TODO: check again
    // if (haveSession) toMyData
    const session = await AuthenticationModule.checkSession();
    if (session) {
      next({ name: Routers.mydata });
    }
  }
});

router.afterEach(async (to, from) => {
  Log.debug(`Router::afterEach:: opened ${to.name} from ${from.name}  at ${Date.now()}`);
  if (from.name) {
    await DiAnalytics.exitScreen(from.name || '');
  } else {
    await DiAnalytics.exitScreen(to.name || '');
  }

  await DiAnalytics.enterScreen(to.name || '');
});
export default router;
