import React from 'react';

import Projects from '../components/projects/Projects';

export default () => (
  <div>
    <section className="hero is-black">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1 className="header title">
            Projects
          </h1>
          <h2 className="header subtitle is-6 has-text-weight-light">
            and Open Source
          </h2>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <Projects />
      </div>
    </section>
  </div>
);
