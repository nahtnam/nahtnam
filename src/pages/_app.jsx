import React from 'react';
import App, { Container } from 'next/app';
import Navigation from '../components/Navigation.jsx';

import '../assets/css/index.scss';

export default class extends App {
  render() {
    const { Component } = this.props;

    return (
      <Container>
        <Navigation />
        <Component />
      </Container>
    );
  }
};
