import { motion } from "framer-motion";
import { useState } from "react";
import { Muted } from "@/components/ui/typography";

const AT_SYMBOL_FADE_DURATION = 0.15;
const AT_SYMBOL_FADED_OPACITY = 0;
const NAME_FLIP_DURATION = 0.25;

export function NameAnimation() {
  const [isHovered, setIsHovered] = useState(false);

  const atSymbolOpacity = isHovered ? 1 : AT_SYMBOL_FADED_OPACITY;
  const nameRotation = isHovered ? 180 : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center">
        <Muted className="mb-3 font-mono text-[0.72rem] tracking-[0.28em] uppercase">
          Hey there, I&apos;m
        </Muted>
        <button
          className="relative cursor-pointer bg-transparent"
          style={{ perspective: "1000px" }}
          type="button"
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
        >
          <motion.span
            animate={{ opacity: atSymbolOpacity }}
            className="absolute top-1/2 right-full mr-3 -translate-y-1/2 font-mono text-4xl text-primary md:mr-4 md:text-5xl"
            initial={{ opacity: AT_SYMBOL_FADED_OPACITY }}
            transition={{
              duration: AT_SYMBOL_FADE_DURATION,
              ease: [0.7, 0, 1, 1],
            }}
          >
            @
          </motion.span>
          <motion.div
            animate={{ rotateY: nameRotation }}
            className="relative"
            style={{ transformStyle: "preserve-3d" }}
            transition={{ duration: NAME_FLIP_DURATION }}
          >
            <div
              className="font-serif text-6xl tracking-[-0.045em] md:text-8xl lg:text-[7.5rem]"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="text-foreground">manthan</span>
            </div>
            <div
              className="absolute inset-0 font-serif text-6xl tracking-[-0.045em] md:text-8xl lg:text-[7.5rem]"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <span className="text-primary italic">nahtnam</span>
            </div>
          </motion.div>
        </button>
      </div>
    </div>
  );
}
