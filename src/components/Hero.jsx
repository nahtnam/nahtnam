import React from 'react';
import Typed from 'react-typed';
import classnames from 'classnames';

const getSize = (size) => {
  if (!size) {
    return '';
  }
  return `is-${size}`;
};

export default data => (
  <div>
    <section className={classnames('hero', 'is-black', getSize(data.size))}>
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1 className="header title is-family-secondary">
            { data.title }
          </h1>
          <h2 className="header subtitle is-6 has-text-weight-light">
            &nbsp;
            <Typed
              strings={[data.subtitle]}
              cursorChar=""
              typeSpeed={40}
            />
            &nbsp;
          </h2>
        </div>
      </div>
    </section>
  </div>
);
