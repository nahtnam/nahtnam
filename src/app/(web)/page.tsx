import {
  faGithub,
  faLinkedin,
  faStackOverflow,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import Image from "next/image";
import Link from "next/link";
import { getDocuments } from "../(cms)/_utils/fetch";
import { ExperienceCards } from "./_components/experience-cards";
import MeImage from "./_images/me.jpg";

export default function Page() {
  const experiences = getDocuments("experiences", [
    "title",
    "startDate",
    "homepage",
  ]);

  const [latestExperience] = _.sortBy(
    experiences.map((experience) => ({
      ...experience,
      startDate: new Date(experience.startDate),
    })),
    "startDate"
  ).reverse();

  return (
    <section className="container mx-auto my-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="avatar">
          <div className="h-40 w-40 rounded-full border-2">
            <Image
              alt="nahtnam avatar"
              height={160}
              src={MeImage}
              width={160}
            />
          </div>
        </div>
        <div className="prose prose-xl max-w-full flex-grow">
          <h2 className="mb-0">👋 Hello!</h2>
          <h1 className="mt-2 mb-0">I&rsquo;m Manthan</h1>
          <h3 className="mt-2">
            You can find me online{" "}
            <Link
              className="link-hover link"
              href="https://keybase.io/nahtnam"
              rel="noreferrer noopener"
              target="_blank"
            >
              @nahtnam
            </Link>
          </h3>
        </div>
        <div className="mt-4 flex gap-4 text-xl md:mt-0 md:flex-col">
          <Link
            href="https://github.com/nahtnam"
            rel="noreferrer noopener"
            target="_blank"
          >
            <FontAwesomeIcon height={24} icon={faGithub} width={24} />
          </Link>
          <Link
            href="https://linkedin.com/in/nahtnam"
            rel="noreferrer noopener"
            target="_blank"
          >
            <FontAwesomeIcon height={24} icon={faLinkedin} width={24} />
          </Link>
          <Link
            href="https://twitter.com/nahtnam"
            rel="noreferrer noopener"
            target="_blank"
          >
            <FontAwesomeIcon height={24} icon={faXTwitter} width={24} />
          </Link>
          <Link
            href="https://stackoverflow.com/users/2537559/nahtnam"
            rel="noreferrer noopener"
            target="_blank"
          >
            <FontAwesomeIcon height={24} icon={faStackOverflow} width={24} />
          </Link>
        </div>
      </div>
      <div className="prose prose-lg mt-8 flex max-w-full flex-col flex-wrap gap-x-4 md:flex-row md:justify-center">
        <div>
          👨‍💻 engineer @{" "}
          <a
            className="link-hover link text-inherit"
            href={latestExperience?.homepage}
            rel="noreferrer noopener"
            target="_blank"
          >
            {latestExperience?.title.toLowerCase()}
          </a>
        </div>
        <div className="hidden md:block">&middot;</div>
        <div>👾 indie hacker</div>
        <div className="hidden md:block">&middot;</div>
        <div>🏸 badminton player</div>
        <div className="hidden md:block">&middot;</div>
        <div>🌎 earth, solar system</div>
      </div>

      <div className="prose prose-lg mt-12 mb-4 max-w-full">
        <h2>Experience</h2>
      </div>
      <ExperienceCards />
      <div className="prose prose-lg mt-4">
        <p>and more...</p>
      </div>
    </section>
  );
}
