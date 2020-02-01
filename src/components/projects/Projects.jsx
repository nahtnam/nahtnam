import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { projects } from '../../public/data/projects.json';
import color from '../../utils/projects/tag-color';

export default () => (
  <div>
    { projects.map((project, index) => (
      <div key={project.name}>
        <div className="columns is-marginless is-vcentered project">
          <div className="column">
            <a href={project.url || project.github} target="_blank" rel="noopener noreferrer" className="title">{ project.name }</a>
          </div>
          <div className="column is-one-third">
            { project.description }
          </div>
          <div className="column">
            <div v-if="project.stack" className="tags">
              { project.stack.concat().sort().map(tag => (
                <span key={tag} className="tag is-black" style={{ backgroundColor: color(tag) }}>{ tag }</span>
              )) }
            </div>
          </div>
          <div className="column has-text-centered links">
            <div className="columns">
              { project.url ? (
                <div className="column">
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="button is-info is-fullwidth is-outlined">
                    <span className="icon">
                      <FontAwesomeIcon icon="eye" />
                    </span>
                    <span>View</span>
                  </a>
                </div>
              ) : null}
              { project.github ? (
                <div className="column">
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="button is-primary is-fullwidth is-outlined">
                    <span className="icon">
                      <FontAwesomeIcon icon={['fab', 'github']} />
                    </span>
                    <span>Source</span>
                  </a>
                </div>
              ) : null }
            </div>
          </div>
        </div>
        { projects.length - 1 !== index ? <hr /> : null}
      </div>
    )) }
    <style jsx>
      {`
        .project {
          padding: 0.5em;
        }
      `}
    </style>
  </div>
);
