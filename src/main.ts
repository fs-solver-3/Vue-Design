import Vue from 'vue';
// LIBS
import { Component } from 'vue-property-decorator';
import { Container } from 'typescript-ioc';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import responsive from 'vue-responsive';
import vClickOutside from 'v-click-outside';
import Vuelidate from 'vuelidate';
import VCalendar from 'v-calendar';
import vuescroll from 'vuescroll';
import vSelect from 'vue-select';
import VueDraggableResizable from 'vue-draggable-resizable';
import { Popover, Table, Tabs } from 'ant-design-vue';

// DATA INSIDER
import App from './App.vue';
// STORES
import store from './store';
import { AuthenticationModule } from '@/store/modules/authentication.store';
// ROUTERS
import router from './router/router';
// COMMON
import { ComponentUtils, DomUtils } from '@/utils';
import { ScrollConfigs } from '@/shared';
import { ChartBuilderModule } from '@/shared/module';
import VueVirtualScroller from 'vue-virtual-scroller';
// CSS
import '@/themes/app.scss';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { DevModule, DI, DIKeys, HttpModule, ProdModule, TestHttpModule } from '@core/modules';
import Highcharts from 'highcharts';
import Mustache from 'mustache';
import { UserManagementModule } from '@core/admin/UserManagementModule';
import { TrackingModule } from '@core/tracking/tracking.module';
import { ShareModule } from '@core/share/share.module';
import { SchemaModule } from '@core/schema/module/SchemaModule';
import { GenIdMethods } from '@/utils/id_generator';
import HighchartsCustomEvents from 'highcharts-custom-events';
import { LogLevel } from '@core/utils/Log';
import VueBlocPlugin from '@/shared/components/VueBloc/install';
import CommonComponentPlugin from '@/shared/components/Common/install';
import { DataIngestionModule } from '@core/DataIngestion/Module/DataIngestionModule';
import DiUploadDocumentPlugin from '@/screens/DataIngestion/components/DiUploadDocument';
import DiIcons from '@/shared/components/Icon/install';

HighchartsCustomEvents(Highcharts as any);

switch (process.env.NODE_ENV) {
  case 'production':
    DomUtils.bind('logLevel', LogLevel.Error);
    window.dumpLog = false;
    DI.init([
      new HttpModule(),
      new ProdModule(),
      new TrackingModule(),
      new ChartBuilderModule(),
      new UserManagementModule(),
      new ShareModule(),
      new SchemaModule(),
      new DataIngestionModule()
    ]);
    break;
  case 'test':
    DI.init([
      new TestHttpModule(),
      new ProdModule(),
      new TrackingModule(),
      new ChartBuilderModule(),
      new UserManagementModule(),
      new ShareModule(),
      new SchemaModule(),
      new DataIngestionModule()
    ]);
    DomUtils.bind('logLevel', LogLevel.All);
    window.dumpLog = true;
    break;
  default:
    DomUtils.bind('logLevel', LogLevel.All);
    window.dumpLog = true;
    DI.init([
      new HttpModule(),
      new DevModule(),
      new TrackingModule(),
      new ChartBuilderModule(),
      new UserManagementModule(),
      new ShareModule(),
      new SchemaModule(),
      new DataIngestionModule()
    ]);
}

// Attach profiler to Window.profiler
DomUtils.bind('profiler', Container.getValue(DIKeys.profiler));
DomUtils.bind('highcharts', Highcharts);
DomUtils.bind('Mustache', Mustache);

Vue.use(responsive);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(vClickOutside);
Vue.use(Vuelidate);
Vue.use(VCalendar);
Vue.component('v-select', vSelect);
Vue.use(vuescroll, {
  ops: ScrollConfigs,
  name: 'vuescroll'
});
Vue.use(VueVirtualScroller);
Vue.use(VueDraggableResizable);
Vue.use(Table);
Vue.use(Tabs);
Vue.use(Popover);
Vue.use(VueBlocPlugin);
Vue.use(CommonComponentPlugin);
Vue.use(DiIcons);

switch (process.env.NODE_ENV) {
  case 'production': {
    Vue.use(DiUploadDocumentPlugin, {
      api: '/api',
      headers: { 'DI-SERVICE-KEY': '12345678' },
      componentName: 'DiUploadComponent',
      chunkSize: 10000
    });
    break;
  }
  default:
    Vue.use(DiUploadDocumentPlugin, {
      api: process.env.VUE_APP_API_HOST,
      headers: { 'DI-SERVICE-KEY': '12345678' },
      componentName: 'DiUploadComponent',
      chunkSize: 10000
    });
}

Vue.mixin({ methods: GenIdMethods });

Vue.config.productionTip = false;
Vue.config.performance = true;

const requireComponents = require.context('@/shared/components', false);
ComponentUtils.registerComponentsAsGlobal(requireComponents);

const filterComponents = require.context('@/shared/components/filters', true);
ComponentUtils.registerComponentsAsGlobal(filterComponents);

// TODO: register global hook
Component.registerHooks(['beforeRouteEnter', 'beforeRouteLeave']);
AuthenticationModule.router = router;
new Vue({
  router,
  store,
  render: h => h(App),
  name: 'Data Insider'
}).$mount('#app');
