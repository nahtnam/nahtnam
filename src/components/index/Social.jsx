import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { media } from '../../public/data/social.json';

export default () => (
  <div>
    <div className="columns is-mobile is-multiline social">
      { media.map(network => (
        <div key={network.url} className="column is-one-quarter-mobile">
          <a href={network.url} className="icon has-text-info fa-3x is-large" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={network.icon} className={network.color} />
          </a>
        </div>
      )) }
    </div>
    <style jsx global>{`
      .social .icon-github {
        color: #212121;
      }
      .social .icon-twitter {
        color: #1da1f2;
      }
      .social .icon-instagram {
        color: #405de6;
      }
      .social .icon-facebook {
        color: #3b5998;
      }
      .social .icon-linkedin {
        color: #0077b5;
      }
      .social .icon-stack-overflow {
        color: #f48024;
      }
      .social .icon-steam {
        color: #000000;
      }
      .social .icon-bitcoin {
        color: #ff9900;
      }
    `}
    </style>
  </div>
);
