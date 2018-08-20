import Vue from 'vue';

import VueAnalytics from 'vue-analytics';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCode, faCamera } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';
import router from './router';
import store from './store';

library.add(fab, faCode, faCamera);
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.use(VueAnalytics, {
  id: 'UA-124193870-1',
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
