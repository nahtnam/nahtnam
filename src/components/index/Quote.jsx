import React from 'react';
import Link from 'next/link';

export default () => (
  <div>
    <nav className="level">
      <div className="level-item has-text-centered">
        <figure className="image is-128x128">
          <img src="https://pbs.twimg.com/profile_images/1039744169026224128/Ne3vqMhM.jpg" alt="Brian Armstrong" className="is-rounded has-text-centered" />
        </figure>
      </div>
    </nav>
    <p className="content is-large quote">
      &ldquo;Excited to see new developers like <a href="https://twitter.com/nahtnam" target="_blank" rel="noopener noreferrer">@nahtnam</a> using the Coinbase API
      <Link href="/">
        <a>
          &nbsp;nahtnam.com
        </a>
      </Link>&rdquo;
    </p>
    <p className="content is-medium quote">
      <strong><a href="https://twitter.com/brian_armstrong" target="_blank" rel="noopener noreferrer">Brian Armstrong</a></strong> <small>(CEO of <a href="https://www.coinbase.com/" target="_blank" rel="noopener noreferrer">Coinbase</a>)</small>
      <br />
      on June 2, 2014
    </p>
    <style jsx>{`
      .quote {
        line-height: 1.25;
      }
    `}
    </style>
  </div>
);
