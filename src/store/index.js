import Vue from 'vue';
import Vuex from 'vuex';
import layout from './modules/layout';
import column from './modules/column';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    layout,
    column
  }
}); 