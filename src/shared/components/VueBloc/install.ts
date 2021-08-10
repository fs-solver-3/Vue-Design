/*
 * @author: tvc12 - Thien Vi
 * @created: 5/31/21, 10:29 PM
 */

import _Vue from 'vue';
import VueBloc from '@/shared/components/VueBloc/VueBloc.vue';
import { VueBlocListener } from '@/shared/components/VueBloc/VueBlocListener';

const VueBlocComponents = {
  install(Vue: typeof _Vue) {
    Vue.component('VueBloc', VueBloc);
    Vue.component('VueBlocListener', VueBlocListener);
  }
};
export default VueBlocComponents;
