import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { projects } from '../../public/data/projects.json';
import color from '../../utils/projects/tag-color';

const showcase = projects.filter((p) => p.showcase);

const ProjectCard = (data) => (
  <div className="column">
    <div className="card">
      <header className="card-header">
        <p className="card-header-title is-centered">
          { data.project.name }
        </p>
      </header>
      <div className="card-content">
        <div className="content">
          <p>{ data.project.description }</p>
          <div className="tags">
            { data.project.stack.concat().sort().map((tag) => (
              <span key={tag} className="tag is-black" style={{ backgroundColor: color(tag) }}>{ tag }</span>
            )) }
          </div>
        </div>
      </div>
      <footer className="card-footer">
        {data.project.url ? (
          <a href={data.project.url} target="_blank" rel="noopener noreferrer" className="card-footer-item">
            <span className="icon">
              <FontAwesomeIcon icon="eye" />
            </span>
            View
          </a>
        ) : null}
        { data.project.github ? (
          <a href={data.project.github} target="_blank" rel="noopener noreferrer" className="card-footer-item">
            <span className="icon">
              <FontAwesomeIcon icon={['fab', 'github']} />
            </span>
            Source
          </a>
        ) : null}
      </footer>
      <style jsx>
        {`
          .card-footer-item .icon {
            padding-right: 1em;
          }
        `}
      </style>
    </div>
  </div>
);

export default () => (
  <div>
    <div className="columns">
      { showcase.map((project) => <ProjectCard key={project.name} project={project} />)}
    </div>
    <div className="columns">
      <div className="column is-one-third is-offset-one-third">
        <Link href="/projects">
          <a className="button is-fullwidth is-info is-outlined">
            <span className="icon">
              <FontAwesomeIcon icon="code" />
            </span>
            <span>View All Projects</span>
          </a>
        </Link>
      </div>
    </div>
  </div>
);
