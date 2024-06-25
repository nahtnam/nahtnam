import Link from "next/link";
import { type ProjectCardData, projectCards } from "../../_data/projects";
import { getMetadata } from "../utils/get-metadata";

async function ProjectCard(props: ProjectCardData) {
  const { name, url, imageSrc } = props;

  const metadata = imageSrc ? null : await getMetadata(url);
  return (
    <Link href={url} target="_blank" className="card card-compact border">
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- okay */}
        <img src={imageSrc ?? metadata?.image} alt={name} />
      </figure>
      <div className="card-body">
        <div className="flex-grow">
          <div className="mb-1 font-bold text-base">{name}</div>
        </div>
      </div>
    </Link>
  );
}

export function ProjectCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 sm:grid-cols-2">
      {projectCards.map((experience) => (
        <ProjectCard key={experience.name} {...experience} />
      ))}
    </div>
  );
}
