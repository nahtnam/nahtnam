/* global fetch */

import React from 'react';
import classnames from 'classnames';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      age: {
        text: '---',
        loading: true,
      },
      contributions: {
        text: '---',
        loading: true,
      },
      repos: {
        text: '---',
        loading: true,
      },
    };

    this.getAge = this.getAge.bind(this);
  }

  componentDidMount() {
    this.getAge();
    const ageInterval = setInterval(this.getAge, 1000);
    this.setState((prevState) => ({
      age: {
        ...prevState.age,
        loading: false,
      },
      ageInterval,
    }));

    this.getRepos();
    this.getContributions();
  }

  componentWillUnmount() {
    const { ageInterval } = this.state;
    clearInterval(ageInterval);
  }

  async getRepos() {
    try {
      const users = ['nahtnam', 'j-tester', 'ludicroushq', 'light-examples'];
      const reqsArr = users.map((usr) => fetch(`https://api.github.com/users/${usr}`));
      const reqs = await Promise.all(reqsArr);
      const res = await Promise.all(reqs.map((r) => r.json()));
      const reposCount = res.reduce((acc, val) => acc + val.public_repos, 0);
      this.setState({
        repos: {
          text: reposCount,
          loading: false,
        },
      });
    } catch (_) {
      this.setState({
        repos: {
          loading: false,
        },
      });
    }
  }

  async getContributions() {
    try {
      const req = await fetch('https://github-contributions-api.now.sh/v1/nahtnam');
      const { years } = await req.json();
      const total = years.reduce((acc, val) => acc + val.total, 0);
      this.setState({
        contributions: {
          text: total.toLocaleString(),
          loading: false,
        },
      });
    } catch (_) {
      this.setState({
        contributions: {
          loading: false,
        },
      });
    }
  }

  getAge(birthday = 'October 10, 1999') {
    const diff = Date.now() - (new Date(birthday).getTime());
    const age = diff / (1000 * 60 * 60 * 24 * 365);
    this.setState({
      age: {
        text: age.toFixed(7),
      },
    });
  }

  render() {
    const { contributions, age, repos } = this.state;
    return (
      <div>
        <div className="columns">
          <div className="column">
            <p className={classnames('title', 'is-marginless', { 'is-loading': contributions.loading })}>
              { contributions.text }+
            </p>
            <p className="heading">
              Contributions on GitHub
            </p>
          </div>
          <div className="column">
            <p className={classnames('title', 'is-marginless', { 'is-loading': age.loading })}>
              { age.text }
            </p>
            <p className="heading">
              Years Old
            </p>
          </div>
          <div className="column">
            <p className={classnames('title', 'is-marginless', { 'is-loading': repos.loading })}>
              { repos.text }+
            </p>
            <p className="heading">
              Active Projects
            </p>
          </div>
        </div>
      </div>
    );
  }
}
