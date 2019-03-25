import React from 'react';
import Link from 'next/link';
import classnames from 'classnames';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  toggleMenu() {
    this.setState(prevState => ({
      active: !prevState.active,
    }));
  }

  closeMenu() {
    this.setState({
      active: false,
    });
  }

  render() {
    const { active } = this.state;
    return (
      <nav id="main-navbar" className="navbar is-black is-transparent">
        <div className="container">
          <div className="navbar-brand">
            <Link href="/">
              <a className="navbar-item has-text-weight-bold">
                <span className="is-size-5">nahtnam</span>
              </a>
            </Link>

            <div className={classnames('navbar-burger', 'burger', { 'is-active': active })} role="navigation" onClick={this.toggleMenu}>
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className={classnames('navbar-menu', 'header', { 'is-active': active })}>
            <div className="navbar-end">
              <Link href="/">
                <a className="navbar-item is-active" role="navigation" onClick={this.closeMenu}>
                  Home
                </a>
              </Link>
              <Link href="/resume">
                <a className="navbar-item is-active" role="navigation" onClick={this.closeMenu}>
                  Résumé
                </a>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
