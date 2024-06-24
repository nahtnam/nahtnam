import Image from "next/image";
import Link from "next/link";
import { SiGithub, SiLinkedin, SiStackoverflow, SiX } from "react-icons/si";
import { ExperienceCards } from "./_components/experience-cards";
import MeImage from "./_images/me.jpg";

export default function Home() {
  return (
    <section className="container mt-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="avatar">
          <div className="h-40 w-40 rounded-full border-2">
            <Image src={MeImage} width={160} height={160} alt="nahtnam avatar" />
          </div>
        </div>
        <div className="prose prose-xl max-w-full flex-grow">
          <h2 className="mb-0">👋 Hello!</h2>
          <h1 className="mt-2 mb-0">I&rsquo;m Manthan</h1>
          <h3 className="mt-2">
            You can find me online{" "}
            <Link href="https://keybase.io/nahtnam" target="_blank" className="link-hover link">
              @nahtnam
            </Link>
          </h3>
        </div>
        <div className="mt-4 flex gap-4 text-xl md:mt-0 md:flex-col">
          <Link href="https://github.com/nahtnam" target="_blank">
            <SiGithub />
          </Link>
          <Link href="https://linkedin.com/in/nahtnam" target="_blank">
            <SiLinkedin />
          </Link>
          <Link href="https://twitter.com/nahtnam" target="_blank">
            <SiX />
          </Link>
          <Link href="https://stackoverflow.com/users/2537559/nahtnam" target="_blank">
            <SiStackoverflow />
          </Link>
        </div>
      </div>
      <div className="prose prose-lg mt-8 flex max-w-full flex-wrap gap-x-4 md:justify-center">
        <div>
          👨‍💻 engineer @{" "}
          <Link href="https://mercury.com/" className="link-hover link text-inherit">
            mercury
          </Link>
        </div>
        <div>&middot;</div>
        <div>👾 indie hacker</div>
        <div>&middot;</div>
        <div>🏸 badminton player</div>
        <div>&middot;</div>
        <div>🌎 earth, solar system</div>
      </div>
      <div className="prose prose-lg mt-12 mb-4 max-w-full">
        <h2>Experience</h2>
      </div>
      <ExperienceCards />
      <div className="prose prose-lg mt-4">
        <p>and more...</p>
      </div>

      {/* <div className="prose prose-lg mt-12 max-w-full">
        <h2>Projects</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="card card-compact border">asdf</div>
        <div className="card card-compact border">asdf</div>
        <div className="card card-compact border">asdf</div>
      </div> */}
      {/* <div className="prose prose-lg mt-12 max-w-full">
        <h2>Blog Posts</h2>
      </div>
      <ul className="not-prose menu menu-lg p-0">
        <li>
          <a>Item 1</a>
        </li>
        <li>
          <a className="active border">Item 2</a>
        </li>
        <li>
          <a className="border">Item 3</a>
        </li>
      </ul> */}
    </section>
  );
}
