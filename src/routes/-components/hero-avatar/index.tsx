import { useCallback, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROTATION_RANGE = 10;

export function HeroAvatar() {
  const [isActive, setIsActive] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const smoothRotateX = useSpring(rotateX, {
    damping: 18,
    stiffness: 220,
  });
  const smoothRotateY = useSpring(rotateY, {
    damping: 18,
    stiffness: 220,
  });

  const resetTilt = useCallback(() => {
    setIsActive(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      setIsActive(true);
      rotateX.set((0.5 - y) * ROTATION_RANGE);
      rotateY.set((x - 0.5) * ROTATION_RANGE);
    },
    [rotateX, rotateY],
  );

  return (
    <motion.div
      className="relative"
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformPerspective: 900,
      }}
    >
      <Avatar
        className={`size-32 rounded-full border-2 transition-shadow duration-300 md:size-40 ${
          isActive
            ? "border-primary/30 shadow-[0_24px_50px_-24px_color-mix(in_srgb,var(--color-primary)_45%,transparent)]"
            : "border-border shadow-[0_18px_40px_-28px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
        }`}
        onPointerLeave={resetTilt}
        onPointerMove={handlePointerMove}
      >
        <AvatarImage
          alt="Manthan"
          className="rounded-full object-cover"
          src="/assets/images/me.avif"
        />
        <AvatarFallback className="rounded-full bg-foreground font-serif text-6xl text-background">
          m
        </AvatarFallback>
      </Avatar>
    </motion.div>
  );
}
