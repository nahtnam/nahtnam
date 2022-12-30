import Image from "next/image";
import { workHistory } from "./components/data/workHistory";
import avatar from './images/avatar.png'
import { Suspense } from "react";
import { BlogPosts } from "./components/BlogPosts";

export default async function Page() {
  return (
    <div className="container mx-auto max-w-xl space-y-8 p-4">
      <section className="flex justify-center">
        <Image src={avatar} alt="nahtnam" width={200} className="shadow-lg rounded-full border-gray-100 border" />
      </section>
      <section className="prose max-w-none prose-h2:uppercase">
        <h2>About me</h2>
        <p>Hi, I&apos;m <b>Manthan</b>. You can find me online <a href="https://keybase.io/nahtnam" target="_blank" rel="noreferrer" ><b>@nahtnam</b></a>.</p>
        <p>I am a <b>full-stack developer</b> with a strong foundation in both front-end and back-end development technologies. Proficient in <b>TypeScript</b>, I have experience working with popular frameworks such as <b>React</b> and <b>Next.js</b>. In my free time, I am a passionate <b>crypto-currency</b> enthusiast, avid gamer, and dedicated <b>badminton</b> player. Always seeking new challenges and opportunities to grow as a developer, I am committed to delivering high-quality work and solving complex problems.</p>
      </section>
      <section className="prose max-w-none prose-h2:uppercase">
        <h2>Blog Posts</h2>
        <Suspense fallback={<button className="btn btn-ghost btn-xl loading">Loading</button>}>
          {/* @ts-expect-error */}
          <BlogPosts />
        </Suspense>
      </section>
      <section className="prose max-w-none prose-h2:uppercase">
        <h2>Work History</h2>
        <div className="grid grid-cols-[1fr_2fr] gap-x-8 gap-y-2">
          {workHistory.map(({ company, duration, position, description}) => (
            <>
              <div>
                <div className="font-bold">{company}</div>
                <div className="text-sm">{position}</div>
                <div className="italic text-xs">{duration}</div>
              </div>
              <div>
                <ul className="my-0">
                  {description.map((item, index) => (
                    <li className="text-sm" key={`${company}-description-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ))}
        </div>
      </section>
    </div>
  )
}
