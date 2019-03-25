import React from 'react';
import App, { Container } from 'next/app';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

import '../assets/css/index.scss';

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
