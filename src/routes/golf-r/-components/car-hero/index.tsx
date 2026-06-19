import { motion } from "framer-motion";
import { CarScene } from "../car-scene";

export function CarHero() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.08),_transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl px-6 pt-10">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <span className="mb-2 inline-block font-mono text-[0.7rem] tracking-[0.3em] text-blue-400 uppercase">
            2026 Volkswagen
          </span>
          <h1 className="font-serif text-6xl tracking-tighter text-white md:text-8xl">
            Golf R
          </h1>
          <p className="mt-1 font-mono text-[0.7rem] tracking-[0.2em] text-white/40 uppercase">
            MK8.5 &middot; Pure White &middot; 4MOTION AWD
          </p>
        </motion.div>
      </div>

      <CarScene />
    </div>
  );
}
