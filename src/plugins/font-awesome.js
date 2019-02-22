import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faBitcoin } from '@fortawesome/free-brands-svg-icons';
import {
  faChevronDown,
  faShippingFast,
  faShoppingBag,
  faBicycle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faBitcoin, faShippingFast, faChevronDown, faShoppingBag, faBicycle);

Vue.component('font-awesome-icon', FontAwesomeIcon);
