/* eslint-disable react/no-danger */
import React from 'react';
import orderBy from 'lodash.orderby';
import classnames from 'classnames';

import { languages } from '../../public/data/languages.json';

const skills = orderBy(languages, ['experience'], ['desc']).map((lang) => {
  const dup = Object.assign(lang, {});
  dup.name = dup.name.split('/').join('/&#8203');
  return dup;
});

const getColor = (experience) => {
  if (experience < 33) {
    return 'is-danger';
  }
  if (experience < 66) {
    return 'is-info';
  }
  return 'is-success';
};

export default () => (
  <div>
    { skills.map((skill) => (
      <div key={skill.name} className="columns no-margin-bottom is-vcentered">
        <div className="column is-one-third header is-size-7" dangerouslySetInnerHTML={{ __html: skill.name }} />
        <div className="column">
          <progress className={classnames('progress', 'is-large', getColor(skill.experience))} value={skill.experience} max="100">
            <div className="progress-bar">
              { skill.experience }%
            </div>
          </progress>
        </div>
      </div>
    )) }
  </div>
);
