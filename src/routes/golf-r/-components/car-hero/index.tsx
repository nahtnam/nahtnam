import { motion } from "framer-motion";
import { CarScene } from "../car-scene";

export function CarHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.06),_transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl px-6 pt-12">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <span className="mb-3 inline-block font-mono text-xs tracking-[0.3em] text-blue-400 uppercase">
            2026 Volkswagen
          </span>
          <h1 className="mb-2 font-black text-5xl tracking-tighter text-white md:text-7xl">
            GOLF R
          </h1>
          <p className="font-mono text-sm tracking-wider text-white/30">
            MK8.5 &middot; Pure White &middot; 4MOTION AWD
          </p>
        </motion.div>
      </div>

      <CarScene />
    </div>
  );
}
