import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faBitcoin } from '@fortawesome/free-brands-svg-icons';
import {
  faShippingFast,
  faShoppingBag,
  faBicycle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faBitcoin, faShippingFast, faShoppingBag, faBicycle);

Vue.component('font-awesome-icon', FontAwesomeIcon);
