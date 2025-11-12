import _ from "lodash";
import Image from "next/image";
import Link from "next/link";
import { getDocuments } from "@/app/(cms)/_utils/fetch";
import type { Experience } from "@/app/(cms)/types";

function ExperienceCard(
  props: Pick<Experience, "title" | "homepage" | "metadataImage">
) {
  const { title, homepage, metadataImage } = props;

  return (
    <Link
      className="card image-full bg-base-100 shadow-sm"
      href={homepage}
      rel="noopener noreferrer"
      target="_blank"
    >
      <figure>
        <figure className="relative h-48 w-full overflow-hidden">
          <Image
            alt={title}
            className="brightness-80"
            fill={true}
            src={metadataImage}
          />
        </figure>
      </figure>
      <div className="card-body justify-end">
        <div className="w-fit rounded bg-white/80 p-2 text-black">
          <div className="font-bold text-lg">{title}</div>
        </div>
      </div>
    </Link>
  );
}

export function ExperienceCards() {
  const experiences = getDocuments("experiences", [
    "title",
    "slug",
    "homepage",
    "startDate",
    "metadataImage",
  ]);

  const sortedExperiences = _.sortBy(
    experiences.map((experience) => ({
      ...experience,
      startDate: new Date(experience.startDate),
    })),
    "startDate"
  ).reverse();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {sortedExperiences.map((experience) => (
        <ExperienceCard key={experience.slug} {...experience} />
      ))}
    </div>
  );
}
