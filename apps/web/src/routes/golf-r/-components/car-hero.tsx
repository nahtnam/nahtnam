import { Move3DIcon } from "lucide-react";

import { CarScene } from "./car-scene";

export function CarHero() {
  return (
    <section className="hero overflow-hidden border-y border-base-300 bg-base-200">
      <div className="hero-content grid w-full max-w-none gap-4 px-0 py-0 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:items-stretch">
        <div className="flex flex-col justify-between gap-10 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          <div>
            <p className="route-kicker">Build ledger · Chassis 2026</p>
            <p className="mt-7 font-mono text-xs tracking-[0.2em] text-base-content/60 uppercase">
              2026 Volkswagen
            </p>
            <h1 className="heading mt-2 text-6xl tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Golf R
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-base-content/65">
              MK8.5 · Pure White · 4MOTION AWD
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-5">
            <span className="badge badge-outline">Ownership record</span>
            <span className="inline-flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.14em] text-base-content/50 uppercase">
              <Move3DIcon aria-hidden="true" className="size-4" />
              Drag to inspect
            </span>
          </div>
        </div>

        <div className="relative min-w-0 border-t border-base-300 bg-base-100 lg:border-t-0 lg:border-l">
          <CarScene />
          <p className="border-t border-base-300 px-5 py-3 text-center text-[0.68rem] leading-5 text-base-content/55 sm:text-left">
            3D model:{" "}
            <a
              className="link link-hover"
              href="https://sketchfab.com/3d-models/2025-volkswagen-golf-r-d1a0e38cbb2b4cb3b0da13c2ccdcf730"
              rel="noreferrer"
              target="_blank"
            >
              2025 Volkswagen Golf R
            </a>{" "}
            by{" "}
            <a
              className="link link-hover"
              href="https://sketchfab.com/ddiaz-design"
              rel="noreferrer"
              target="_blank"
            >
              Ddiaz Design
            </a>{" "}
            on Sketchfab, licensed{" "}
            <a
              className="link link-hover"
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              rel="noreferrer"
              target="_blank"
            >
              CC BY-NC-SA 4.0
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
