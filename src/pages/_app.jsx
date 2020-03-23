/* eslint-disable import/first, react/jsx-props-no-spreading */
import React from 'react';
import App from 'next/app';
import Head from 'next/head';

import '../assets/css/index.scss';

import { library, config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;
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
  faShieldAlt,
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
  faShieldAlt,
);

export default class extends App {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <Head>
          <title>nahtnam</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" hid="description" content="my personal portfolio." />
          <link rel="icon" type="image/png" href="/favicon.png" />
        </Head>
        <Navigation />
        <Component {...pageProps} />
        <Footer />
      </>
    );
  }
}
