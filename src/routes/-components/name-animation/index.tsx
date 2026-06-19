import { motion } from "framer-motion";
import { useState } from "react";

const NAME_FLIP_DURATION = 0.28;

export function NameAnimation() {
  const [isHovered, setIsHovered] = useState(false);
  const nameRotation = isHovered ? 180 : 0;

  return (
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
      <motion.div
        animate={{ rotateY: nameRotation }}
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: NAME_FLIP_DURATION }}
      >
        <div
          className="flex items-center justify-center font-serif text-6xl leading-[0.95] tracking-[-0.045em] md:text-8xl lg:text-[7.5rem]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-foreground">manthan</span>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center font-serif text-6xl leading-[0.95] tracking-[-0.045em] md:text-8xl lg:text-[7.5rem]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="text-primary">@</span>
          <span className="text-primary italic">nahtnam</span>
        </div>
      </motion.div>
    </button>
  );
}
