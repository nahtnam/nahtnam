import { logger } from "@/logger";
import ms from "ms";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import urlMetadata from "url-metadata";
import { type ExperienceCardData, experienceCards } from "../../_data/experience";

async function getMetadata(url: string) {
  try {
    const metadata = await urlMetadata(url);
    return {
      title: metadata.title as string,
      description: metadata.description as string,
      image: (metadata["og:image"] || metadata["twitter:image"]) as string,
    };
  } catch (err) {
    logger.error(err);
    return null;
  }
}

async function ExperienceCard(props: ExperienceCardData) {
  const { company, roles, url, startDate, endDate, imageSrc } = props;

  const metadata = imageSrc ? null : await getMetadata(url);
  const length = Math.ceil(((endDate?.getTime() ?? Date.now()) - startDate.getTime()) / ms("1y"));
  return (
    <Link href={url} target="_blank" className="card card-compact border">
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- okay */}
        <img src={imageSrc ?? metadata?.image} alt={company} />
      </figure>
      <div className="card-body">
        <div className="flex-grow">
          <div className="mb-1 font-bold text-base">
            <div>{roles[0]}</div> @ {company} for ~{length > 1 ? `${length.toString()} years` : "1 year"}
          </div>
          {roles.slice(1).map((role, index) => (
            <div key={`${company}-role-${index.toString()}`} className={twMerge("text-xs uppercase")}>
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 sm:grid-cols-2">
      {experienceCards.map((experience) => (
        <ExperienceCard key={experience.company} {...experience} />
      ))}
    </div>
  );
}
