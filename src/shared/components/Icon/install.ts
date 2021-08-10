/*
 * @author: tvc12 - Thien Vi
 * @created: 7/12/21, 5:28 PM
 */

import Vue from 'vue';

const DiIcons = Object.freeze({
  install(vue: typeof Vue) {
    vue.component('DeactivateSingleChoiceIcon', () => import('./DeactivateSingleChoiceIcon.vue'));
    vue.component('ActiveSingleChoiceIcon', () => import('./ActiveSingleChoiceIcon.vue'));
    vue.component('ActiveMultiChoiceIcon', () => import('./ActiveMultiChoiceIcon.vue'));
    vue.component('DeactivateMultiChoiceIcon', () => import('./DeactivateMultiChoiceIcon.vue'));
  }
});

export default DiIcons;
