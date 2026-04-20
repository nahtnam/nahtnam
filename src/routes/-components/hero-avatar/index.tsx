import { useCallback, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AVATAR_HOVER_SCALE = 1.03;
const ROTATION_RANGE = 14;

export function HeroAvatar() {
  const [isActive, setIsActive] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);
  const offsetY = useMotionValue(0);

  const smoothRotateX = useSpring(rotateX, {
    damping: 18,
    stiffness: 220,
  });
  const smoothRotateY = useSpring(rotateY, {
    damping: 18,
    stiffness: 220,
  });
  const smoothScale = useSpring(scale, {
    damping: 16,
    stiffness: 240,
  });
  const smoothOffsetY = useSpring(offsetY, {
    damping: 18,
    stiffness: 220,
  });

  const resetTilt = useCallback(() => {
    setIsActive(false);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    offsetY.set(0);
  }, [offsetY, rotateX, rotateY, scale]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      setIsActive(true);
      rotateX.set((0.5 - y) * ROTATION_RANGE);
      rotateY.set((x - 0.5) * ROTATION_RANGE);
      scale.set(AVATAR_HOVER_SCALE);
      offsetY.set(-4);
    },
    [offsetY, rotateX, rotateY, scale],
  );

  const handlePointerEnter = useCallback(() => {
    setIsActive(true);
    scale.set(AVATAR_HOVER_SCALE);
    offsetY.set(-4);
  }, [offsetY, scale]);

  return (
    <motion.div
      className="relative rounded-[2rem]"
      style={{
        boxShadow: isActive
          ? "0 34px 68px -28px color-mix(in srgb, var(--color-primary) 42%, transparent)"
          : "0 24px 48px -30px color-mix(in srgb, var(--color-primary) 35%, transparent)",
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        scale: smoothScale,
        transformPerspective: 900,
        y: smoothOffsetY,
      }}
      transition={{ stiffness: 300, type: "spring" }}
    >
      <div className="-inset-3 pointer-events-none absolute rounded-[2.4rem] border border-primary/18 bg-white/35" />
      <div className="-inset-1 pointer-events-none absolute rounded-[2.2rem] border border-white/80 bg-gradient-to-br from-white/80 to-transparent" />
      <Avatar
        className="relative size-40 rounded-[2rem] border border-white/80 shadow-[0_30px_70px_-36px_color-mix(in_srgb,var(--color-primary)_45%,transparent)] md:size-48"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={resetTilt}
        onPointerMove={handlePointerMove}
      >
        <AvatarImage
          alt="Manthan"
          className="rounded-[2rem]"
          src="/assets/images/me.avif"
        />
        <AvatarFallback className="rounded-[2rem] bg-foreground font-serif text-6xl text-background md:text-7xl">
          m
        </AvatarFallback>
      </Avatar>
    </motion.div>
  );
}
