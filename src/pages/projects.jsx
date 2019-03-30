import React from 'react';

import Hero from '../components/Hero';
import Projects from '../components/projects/Projects';

export default () => (
  <div>
    <Hero title="Projects" subtitle="and Open Source" />
    <section className="section">
      <div className="container">
        <Projects />
      </div>
    </section>
  </div>
);
