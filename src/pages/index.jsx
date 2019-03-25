import React from 'react';

import AboutMe from '../components/index/AboutMe';
import Quote from '../components/index/Quote';

import Timeline from '../components/index/Timeline';

export default () => (
  <div>
    <section className="hero is-medium is-black">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1 className="header title">
            Hi, I'm Manthan.
          </h1>
          <h2 className="header subtitle is-6 has-text-weight-light">
            You can find me online <a href="https://keybase.io/nahtnam" className="has-text-weight-bold is-lowercase" target="_blank" rel="noopener noreferrer">@nahtnam</a>.
          </h2>
        </div>
      </div>
    </section>
    <section id="first-section" className="section">
      <div className="container">
        <div className="columns">
          <div className="column no-pad-bottom is-three-quarters">
            <div className="has-text-centered">
              <h1 className="header title is-4">
                About Me
              </h1>
              <AboutMe />
            </div>
            <hr />
            <div className="has-text-centered">
              <h1 className="header title is-4">
                Statistics
              </h1>
              {/* <Statistics /> */}
            </div>
            <hr />
            <div className="has-text-centered">
              <h1 className="header title is-4">
                Projects
              </h1>
              {/* <Projects /> */}
            </div>
            <hr />
            <div className="has-text-centered">
              <h1 className="header title is-4">
                Social Media
              </h1>
              {/* <Social /> */}
            </div>
            <hr />
            <div className="has-text-centered">
              <h1 className="header title is-4">
                Shout-Outs
              </h1>
              <Quote />
            </div>
          </div>
          <div className="column no-pad-bottom is-one-quarter">
            <hr className="is-hidden-tablet" />
            <div>
              <h1 className="header title is-4 has-text-centered">
                Work
              </h1>
              <Timeline />
            </div>
            <hr />
            <div className="has-text-centered">
              <h1 className="header title is-4">
                Experience
              </h1>
              {/* <Languages /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);
