import ms from "ms";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import {
  type ExperienceCardData,
  experienceCards,
} from "../../_data/experience";
import { getMetadata } from "@/app/_utils/get-metadata";

async function getDate() {
  "use cache";
  return new Date();
}

async function ExperienceCard(props: ExperienceCardData) {
  const { company, roles, url, startDate, endDate, imageSrc } = props;

  const currentDate = await getDate();

  const metadata = imageSrc ? null : await getMetadata(url);
  const length = Math.ceil(
    ((endDate?.getTime() ?? currentDate.getTime()) - startDate.getTime()) /
      ms("1y"),
  );
  return (
    <Link
      href={url}
      target="_blank"
      className="card card-compact border"
      rel="noreferrer"
    >
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- okay */}
        <img src={imageSrc ?? metadata?.image} alt={company} />
      </figure>
      <div className="card-body">
        <div className="flex-grow">
          <div className="mb-1 text-base font-bold">
            <div>{roles[0]}</div> @ {company} for ~
            {length > 1 ? `${length.toString()} years` : "1 year"}
          </div>
          {roles.slice(1).map((role, index) => (
            <div
              key={`${company}-role-${index.toString()}`}
              className={twMerge("text-xs uppercase")}
            >
              & prev. {role}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function ExperienceCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {experienceCards.map((experience) => (
        <ExperienceCard key={experience.company} {...experience} />
      ))}
    </div>
  );
}
