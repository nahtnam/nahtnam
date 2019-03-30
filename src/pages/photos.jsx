import React from 'react';

import Hero from '../components/Hero';
import Photos from '../components/photos/Photos';

export default () => (
  <div>
    <Hero title="Photos" subtitle="(click to view)" />
    <section className="section">
      <div className="container">
        <Photos />
      </div>
    </section>
  </div>
);
