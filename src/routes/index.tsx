import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Github, Linkedin, Rocket, Twitter } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: RouteComponent });

const socialLinks = [
  { icon: Github, name: "GitHub", url: "https://github.com/nahtnam" },
  { icon: Linkedin, name: "LinkedIn", url: "https://linkedin.com/in/nahtnam" },
  { icon: Twitter, name: "Twitter", url: "https://twitter.com/nahtnam" },
];

const companies = [
  { name: "Mercury", url: "https://mercury.com/" },
  { name: "Twingate", url: "https://twingate.com/" },
  { name: "Lime", url: "https://www.li.me/" },
  { name: "Rakuten", url: "https://www.rakuten.com/" },
  { name: "Decklar", url: "https://www.decklar.com/" },
  { name: "Fold", url: "https://foldapp.com/" },
];

function NameAnimation() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const actualFlipped = isHovered ? !isFlipped : isFlipped;

  useEffect(() => {
    if (isHovered) {
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];

    const runSequence = () => {
      const t1 = setTimeout(() => {
        setIsFlipped(true);
      }, 1500);
      timeouts.push(t1);

      const t2 = setTimeout(() => {
        setIsFlipped(false);
      }, 3500);
      timeouts.push(t2);
    };

    runSequence();
    const interval = setInterval(runSequence, 5500);

    return () => {
      clearInterval(interval);
      for (const t of timeouts) {
        clearTimeout(t);
      }
    };
  }, [isHovered]);

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 font-medium text-lg text-muted-foreground">
        Hey there, I&apos;m
      </p>
      <button
        className="relative flex cursor-pointer items-center gap-2 bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ perspective: "1000px" }}
        type="button"
      >
        <span
          className="font-bold font-mono text-6xl tracking-normal transition-colors duration-800 md:text-8xl"
          style={{
            color: actualFlipped
              ? "hsl(var(--foreground))"
              : "rgba(100, 100, 100, 0.15)",
            transition: "color 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          @
        </span>

        <div
          className="relative"
          style={{
            transform: actualFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            className="font-bold font-mono text-6xl tracking-normal md:text-8xl"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <span className="text-foreground">manthan</span>
          </div>
          <div
            className="absolute inset-0 font-bold font-mono text-6xl tracking-normal md:text-8xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <span className="text-indigo-500">nahtnam</span>
          </div>
        </div>
      </button>
    </div>
  );
}

function RouteComponent() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="-left-32 absolute top-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-3xl dark:from-blue-900/15 dark:to-purple-900/15" />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="relative mb-10">
          <div className="-m-4 absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-60 blur-xl dark:opacity-40" />
          <div
            className="-m-6 absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 opacity-40 blur-2xl dark:opacity-30"
            style={{ animationDuration: "8s" }}
          />

          <div className="relative">
            <div className="flex h-28 w-28 rotate-3 items-center justify-center rounded-3xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-2xl transition-transform duration-500 hover:rotate-0 hover:scale-105 md:h-32 md:w-32">
              <span className="font-bold font-serif text-5xl md:text-6xl">
                m
              </span>
            </div>
          </div>
        </div>

        <h1 className="mb-6 text-center">
          <NameAnimation />
        </h1>

        <a
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-5 py-2.5 text-sm backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:bg-indigo-50/50 hover:shadow-lg dark:hover:bg-indigo-950/20"
          href="https://mercury.com/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-muted-foreground">engineer</span>
          <span className="font-medium text-foreground">@ Mercury</span>
          <ArrowUpRight className="group-hover:-translate-y-0.5 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </a>

        <p className="mb-8 max-w-md text-center text-lg text-muted-foreground leading-relaxed">
          Software Engineer with experience at high-growth startups. Building
          things that matter.
        </p>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <span className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 font-medium text-blue-900 text-sm transition-all hover:scale-105 hover:shadow-md dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-100">
            <Rocket className="group-hover:-translate-y-0.5 h-4 w-4 transition-transform" />
            indie hacker
          </span>
          <span className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 px-4 py-2 font-medium text-sm text-violet-900 transition-all hover:scale-105 hover:shadow-md dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-100">
            <span className="text-base">🏸</span>
            badminton player
          </span>
        </div>

        <div className="mb-12 flex items-center gap-3">
          {socialLinks.map((social, index) => (
            <a
              aria-label={social.name}
              className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-background/80 text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-indigo-500/30 hover:text-indigo-600 hover:shadow-lg dark:hover:text-indigo-400"
              href={social.url}
              key={social.name}
              rel="noopener noreferrer"
              style={{ animationDelay: `${index * 100}ms` }}
              target="_blank"
            >
              <social.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
            </a>
          ))}
        </div>

        <a
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-8 py-4 font-medium text-background transition-all hover:shadow-2xl hover:shadow-indigo-500/20"
          href="mailto:me@nahtnam.com"
        >
          <span className="relative z-10">Get in Touch</span>
          <ArrowUpRight className="group-hover:-translate-y-0.5 relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          <div className="-translate-x-full absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-transform duration-300 group-hover:translate-x-0" />
        </a>

        <div className="mt-16 flex flex-col items-center gap-4">
          <span className="text-muted-foreground/60 text-xs">
            Previously at
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {companies.map((company) => (
              <a
                className="group relative text-muted-foreground/60 text-xs transition-colors hover:text-foreground"
                href={company.url}
                key={company.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                {company.name}
                <span className="-bottom-0.5 absolute left-0 h-px w-0 bg-indigo-500 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
