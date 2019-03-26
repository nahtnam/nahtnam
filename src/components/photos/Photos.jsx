import React from 'react';

import { photos } from '../../static/data/photos.json';

export default () => (
  <div>
    <div className="columns is-gapless is-multiline">
      { photos.map(photo => (
        <div key={photo.url} className="column is-one-third photo">
          <a href={photo.url} target="_blank" rel="noopener noreferrer">
            <div className="card">
              <div className="card-image">
                <figure className="image is-4by3">
                  <img src={photo.url} alt={photo.caption} />
                </figure>
              </div>
            </div>
          </a>
        </div>
      )) }
    </div>
    <style jsx>
      {`
        .photo {
          border: 1px solid white;
        }
      `}
    </style>
  </div>
);
