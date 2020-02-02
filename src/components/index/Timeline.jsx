import React from 'react';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { layout } from '../../public/data/timeline.json';

const TimelineTag = data => (
  <div>
    <header className="timeline-header">
      <span className={classnames('tag', data.item.color, data.item.size)}>
        { data.item.text }
      </span>
    </header>
    <style jsx>{`
      .tag.icon-bitcoin {
        background-color: #ff9900;
        color: #ffffff;
      }
    `}
    </style>
  </div>
);

const TimelineItem = (data) => {
  const isFuture = Date.now() < (new Date(data.item.startDate)).getTime();

  return (
    <div>
      <div className={classnames('timeline-item', data.item.color)}>
        <div className={classnames('timeline-marker', 'is-icon', 'has-text-white', data.item.color, { 'is-large': data.item.large })}>
          <FontAwesomeIcon icon={data.item.icon} />
        </div>
        <div className="timeline-content">
          <p className="heading">
            <strong>{ data.item.company }</strong> - { data.item.role }
            <br />
            { isFuture ? <i><strong>FUTURE</strong> ({ data.item.startDate })</i> : (
              <i>
                { data.item.startDate } - { data.item.endDate
                  ? <span>{ data.item.endDate }</span> : <span><strong>Now</strong></span>
                }
              </i>
            )}
          </p>
        </div>
      </div>
      <style jsx>{`
        .timeline-item.icon-bitcoin::before {
          background-color: #ff9900;
        }
        .timeline-item .timeline-marker.icon-bitcoin.is-icon {
          border-color: #ff9900;
          background-color: #ff9900;
          color: #ffffff;
        }
        .is-large {
          font-size: 1.25em;
        }
      `}
      </style>
    </div>
  );
};

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      layout,
    };
  }

  render() {
    const { layout: timeline } = this.state;
    return (
      <div className="timeline">
        <header className="timeline-header">
          <span className="tag is-primary">NOW</span>
        </header>
        { timeline.map((item) => {
          if (item.type === 'tag') {
            return <TimelineTag key={item.text || item.company} item={item} />;
          }
          return <TimelineItem key={item.text || item.company} item={item} />;
        })}
      </div>
    );
  }
}
