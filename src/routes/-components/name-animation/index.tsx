import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Muted } from "@/routes/-shadcn/components/ui/typography";

const AT_SYMBOL_FADE_DURATION = 0.15;
const AT_SYMBOL_FADED_OPACITY = 0;
const NAME_FLIP_DURATION = 0.25;
const NAME_FLIP_INTERVAL = 5000;

export function NameAnimation() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const actualFlipped = isHovered ? !isFlipped : isFlipped;
  const atSymbolOpacity = actualFlipped ? 1 : AT_SYMBOL_FADED_OPACITY;
  const nameRotation = actualFlipped ? 180 : 0;

  useEffect(() => {
    if (isHovered) {
      return;
    }

    const flip = () => setIsFlipped((prev) => !prev);
    const interval = setInterval(flip, NAME_FLIP_INTERVAL);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div className="flex flex-col items-center">
      <Muted className="mb-2 text-lg">Hey there, I&apos;m</Muted>
      <button
        className="relative flex cursor-pointer items-center gap-2 bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ perspective: "1000px" }}
        type="button"
      >
        <motion.span
          animate={{ opacity: atSymbolOpacity }}
          className="font-bold font-mono text-6xl text-foreground md:text-8xl"
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
            className="font-bold font-mono text-6xl md:text-8xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-foreground">manthan</span>
          </div>
          <div
            className="absolute inset-0 font-bold font-mono text-6xl md:text-8xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="text-indigo-500">nahtnam</span>
          </div>
        </motion.div>
        <span className="invisible font-bold font-mono text-6xl text-foreground md:text-8xl">
          @
        </span>
      </button>
    </div>
  );
}
