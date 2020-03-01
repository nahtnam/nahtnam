import React, { useState } from 'react';

function Footer() {
  const [year] = useState((new Date()).getFullYear());

  return (
    <footer className="footer">
      <div className="content has-text-centered">
        <p>
          <a href="https://www.nahtnam.com" className="has-text-grey-dark">
            &copy;
            {' '}
            { year }
            {' '}
            nahtnam
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
