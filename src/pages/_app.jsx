import React from 'react';
import App, { Container } from 'next/app';


import '../assets/css/index.scss';

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
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

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

export default class extends App {
  render() {
    const { Component } = this.props;

    return (
      <Container>
        <Navigation />
        <Component />
        <Footer />
      </Container>
    );
  }
}
