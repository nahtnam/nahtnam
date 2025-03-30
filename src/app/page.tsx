import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MeImage from "./_images/me.jpg";
import { ExperienceCards } from "./_components/experience-cards";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faXTwitter,
  faStackOverflow,
} from "@fortawesome/free-brands-svg-icons";

export const metadata: Metadata = {
  title: "@nahtnam - Manthan Mallikarjun",
  description:
    "Hello! I’m Manthan You can find me online @nahtnam. This is my portfolio where you can read about me and my thoughts.",
};

export default function Home() {
  return (
    <section className="container mx-auto mt-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="avatar">
          <div className="h-40 w-40 rounded-full border-2">
            <Image
              src={MeImage}
              width={160}
              height={160}
              alt="nahtnam avatar"
            />
          </div>
        </div>
        <div className="prose prose-xl max-w-full flex-grow">
          <h2 className="mb-0">👋 Hello!</h2>
          <h1 className="mt-2 mb-0">I&rsquo;m Manthan</h1>
          <h3 className="mt-2">
            You can find me online{" "}
            <Link
              href="https://keybase.io/nahtnam"
              target="_blank"
              className="link-hover link"
              rel="noreferrer"
            >
              @nahtnam
            </Link>
          </h3>
        </div>
        <div className="mt-4 flex gap-4 text-xl md:mt-0 md:flex-col">
          <Link
            href="https://github.com/nahtnam"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon width={24} height={24} icon={faGithub} />
          </Link>
          <Link
            href="https://linkedin.com/in/nahtnam"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon width={24} height={24} icon={faLinkedin} />
          </Link>
          <Link
            href="https://twitter.com/nahtnam"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon width={24} height={24} icon={faXTwitter} />
          </Link>
          <Link
            href="https://stackoverflow.com/users/2537559/nahtnam"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon width={24} height={24} icon={faStackOverflow} />
          </Link>
        </div>
      </div>
      <div className="prose prose-lg mt-8 flex max-w-full flex-col flex-wrap gap-x-4 md:flex-row md:justify-center">
        <div>
          👨‍💻 engineer @{" "}
          <Link
            href="https://mercury.com/"
            className="link-hover link text-inherit"
          >
            mercury
          </Link>
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
