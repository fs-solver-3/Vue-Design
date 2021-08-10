/*
 * @author: tvc12 - Thien Vi
 * @created: 7/1/21, 10:51 AM
 */

import Vue from 'vue';

const CommonComponentPlugin = Object.freeze({
  install(vue: typeof Vue) {
    vue.component('DiDropdown', () => import('./DiDropdown/DiDropdown.vue'));
    vue.component('DiSlider', () => import('./DiSlider/DiSlider.vue'));
  }
});

export default CommonComponentPlugin;
