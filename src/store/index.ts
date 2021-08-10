import Vue from 'vue';
import Vuex from 'vuex';
import { config } from 'vuex-module-decorators';
// Set rawError to true by default on all @Action decorators
config.rawError = true;

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({ strict: debug });
