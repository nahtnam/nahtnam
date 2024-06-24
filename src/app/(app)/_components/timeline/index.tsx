import { twMerge } from 'tailwind-merge';
import { resume as rawExperience } from '../../_data/experience';

export function Timeline() {
  const experience = rawExperience.reduce<typeof rawExperience>((acc, curr) => {
    if (curr.collapse) {
      const prevItem = acc[acc.length - 1];
      if (prevItem) {
        prevItem.startDate = curr.startDate;
      }
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
  // const totalExperience = experience.reduce(
  //   (acc, curr) =>
  //     acc +
  //     (curr.endDate
  //       ? curr.endDate.getTime() - curr.startDate.getTime()
  //       : Date.now() - curr.startDate.getTime()),
  //   0,
  // );

  return (
    <div>
      <h2 className="mb-4">Experience</h2>
      {/* <p className="text-sm font-bold uppercase">
        {formatDuration(
          intervalToDuration({
            start: new Date(Date.now() - totalExperience),
            end: new Date(),
          }),
          {
            delimiter: ', ',
            format: ['years', 'months'],
          },
        )}
      </p> */}
      <ul className="not-prose timeline timeline-vertical timeline-compact mt-4">
        {experience.map((ex) => (
          <li key={ex.startDate.toString()}>
            <div className="timeline-start text-sm font-bold uppercase tracking-wider">
              {/* {ex.endDate
                ? `~${formatDuration(
                    intervalToDuration({
                      start: ex.startDate,
                      end: ex.endDate,
                    }),
                    {
                      delimiter: ', ',
                      format: ['years', 'months'],
                    },
                  )}`
                : 'Current'} */}
            </div>
            <div
              className={twMerge(
                'timeline-middle rounded-full p-1',
                ex.iconClass,
              )}
            >
              {ex.icon}
            </div>
            <div className="timeline-end timeline-box w-full text-sm">
              <div className="font-bold">{ex.title}</div>
              <div>{ex.company}</div>
              <div className="text-xs uppercase">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  year: 'numeric',
                }).format(ex.startDate)}{' '}
                -{' '}
                {ex.endDate
                  ? new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      year: 'numeric',
                    }).format(ex.endDate)
                  : 'Now'}
              </div>
            </div>
            <hr />
          </li>
        ))}
        <li>
          <div className="timeline-middle rounded-full bg-neutral p-1 text-neutral-content">
            <div className="h-4 w-4" />
          </div>
          <hr />
        </li>
      </ul>
    </div>
  );
}
