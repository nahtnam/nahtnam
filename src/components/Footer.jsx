import React from 'react';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      year: (new Date()).getFullYear(),
    };
  }

  render() {
    const { year } = this.state;
    return (
      <div>
        <footer className="footer">
          <div className="content has-text-centered">
            <p>
              &copy; { year } nahtnam.
            </p>
          </div>
        </footer>
        <style jsx>{`
          .footer {
            padding: 3rem 1.5rem;
          }
        `}
        </style>
      </div>
    );
  }
}
