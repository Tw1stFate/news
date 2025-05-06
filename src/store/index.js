import Vue from 'vue';
import Vuex from 'vuex';
import layout from './modules/layout';
import widget from './modules/widget';
import channel from './modules/channel';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    layout,
    widget,
    channel
  }
}); 