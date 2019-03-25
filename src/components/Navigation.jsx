import React from 'react';
import Link from 'next/link'

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
    this.setState({
      active: !this.state.active,
    });
  }

  closeMenu() {
    this.setState({
      active: false,
    });
  }

  render() {
    return (
      <nav id="main-navbar" className="navbar is-black is-transparent">
        <div className="container">
          <div className="navbar-brand">
            <Link href="/">
              <a className="navbar-item has-text-weight-bold">
                <span className="is-size-5">nahtnam</span>
              </a>
            </Link>

            <div className={['navbar-burger', 'burger', this.state.active ? 'is-active' : ''].filter(x => x).join(' ')} onClick={this.toggleMenu}>
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className={['navbar-menu', 'header', this.state.active ? 'is-active' : ''].filter(x => x).join(' ')}>
            <div className="navbar-end">
              <Link href="/">
                <a className="navbar-item is-active" onClick={this.closeMenu}>
                  Home
                </a>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
