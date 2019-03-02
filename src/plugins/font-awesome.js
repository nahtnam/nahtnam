import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBitcoin,
  faGithub,
  faTwitter,
  faInstagram,
  faFacebookSquare,
  faLinkedin,
  faStackOverflow,
  faSteam,
} from '@fortawesome/free-brands-svg-icons';
import {
  faShippingFast,
  faShoppingBag,
  faBicycle,
  faGraduationCap,
  faCode,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faBitcoin,
  faShippingFast,
  faShoppingBag,
  faBicycle,
  faGraduationCap,
  faGithub,
  faTwitter,
  faInstagram,
  faFacebookSquare,
  faLinkedin,
  faStackOverflow,
  faSteam,
  faCode,
  faEye,
);

Vue.component('font-awesome-icon', FontAwesomeIcon);
