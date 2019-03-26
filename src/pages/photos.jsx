import React from 'react';
import Photos from '../components/photos/Photos';

export default () => (
  <div>
    <section className="hero is-black">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1 className="header title">
            Photos
          </h1>
          <h2 className="header subtitle is-6 has-text-weight-light">
            (click to view)
          </h2>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <Photos />
      </div>
    </section>
  </div>
);
